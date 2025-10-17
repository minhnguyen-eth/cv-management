<?php

namespace App\Http\Controllers\auth;

use App\Http\Controllers\Controller;
use App\Jobs\PasswordResetJob;
use App\Jobs\VerifyUserJobs;
use App\Models\User;
use App\Traits\ApiResponseWithHttpSTatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use JWTAuth;
use Symfony\Component\HttpFoundation\Response;
use Carbon\Carbon;
use App\Mail\PasswordResetMail;  
use Illuminate\Support\Facades\Mail;
class AuthController extends Controller
{
    use ApiResponseWithHttpSTatus;

    /**
     * Create a new AuthController instance.
     *
     * @return void
     */
    public function __construct() {
        $this->middleware('auth:api', ['except' => ['login', 'register','accountVerify','forgotPassword','updatePassword']]);
    }

    /**
     * Get a JWT via given credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request){
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        if (! $token = JWTAuth::attempt($validator->validated())) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $this->createNewToken($token);
    }

    /**
     * Register a User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
public function register(Request $request) {
    // rules chung
    $baseRules = [
        'email' => 'required|string|email|max:100|unique:users',
        'password' => 'required|string|confirmed|min:6',
        'role' => 'required|in:0,1', // 0=candidate, 1=employer
    ];

    $role = (int) $request->input('role', 0);

    // rules theo vai trò
    $extraRules = $role === 1
        ? [ // Nhà tuyển dụng
            'company_name' => 'required|string|max:255',
            'company_address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'name' => 'nullable|string|max:255', // nếu không gửi thì name sẽ = company_name
        ]
        : [ // Ứng viên
            'full_name' => 'required|string|max:255',
            'dob' => 'nullable|date',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'name' => 'nullable|string|max:255', // nếu không gửi thì name sẽ = full_name
        ];

    $validator = Validator::make($request->all(), $baseRules + $extraRules);
    if ($validator->fails()) {
        return response()->json($validator->errors()->toJson(), 400);
    }

    return DB::transaction(function () use ($request, $role) {
        $name = $request->input('name');

        if ($role === 1) {
            // name mặc định = tên công ty nếu client không gửi name riêng
            $name = $name ?: $request->company_name;
        } else {
            // name mặc định = họ tên
            $name = $name ?: $request->full_name;
        }

        $user = User::create([
            'name'     => $name,
            'email'    => $request->email,
            'password' => bcrypt($request->password),
            'slug'     => Str::random(15),
            'token'    => Str::random(20),
            'status'   => 'active',
            'is_admin' => $role, // 1=nhà tuyển dụng, 0=ứng viên

            // lưu thẳng vào bảng users
            'full_name'       => $role === 0 ? $request->full_name : null,
            'dob'             => $role === 0 ? $request->dob : null,
            'address'         => $role === 0 ? $request->address : null,
            'company_name'    => $role === 1 ? $request->company_name : null,
            'company_address' => $role === 1 ? $request->company_address : null,
            'phone'           => $request->phone, // dùng chung
        ]);

        // gửi mail verify như cũ
        $details = [
            'name'      => $user->name,
            'email'     => $user->email,
            'hashEmail' => Crypt::encryptString($user->email),
            'token'     => $user->token
        ];
        dispatch(new VerifyUserJobs($details));

        // trả token luôn nếu bạn muốn
        $token = JWTAuth::fromUser($user);

        return $this->apiResponse('User successfully registered', $data = [
            'token'      => $token,
            'token_type' => 'bearer',
            'expires_in' => JWTAuth::factory()->getTTL() * 60,
            'user'       => [
                'id'       => $user->id,
                'email'    => $user->email,
                'is_admin' => (int) $user->is_admin,
                'name'     => $user->name,
                'full_name' => $user->full_name,
                'company_name' => $user->company_name,
                'phone'    => $user->phone,
            ],
        ], Response::HTTP_OK, true);
    });
}



    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function accountVerify($token,$email) {
        $user = User::where([['email',Crypt::decryptString($email)],['token',$token]])->first();
        if ($user && $user->token == $token) {
            $user->update([
                'verify'=>true,
                'token'=>null
            ]);
            return redirect()->to('http://127.0.0.1:8000/verify/success');
        }
        return redirect()->to('http://127.0.0.1:8000/verify/invalid_token');
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout() {
        auth()->logout();
        return $this->apiResponse('Sign out success',null,Response::HTTP_OK,true);
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh() {
        return $this->createNewToken(auth()->refresh());
    }

    /**
     * Get the authenticated User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function userProfile() {
        return $this->apiResponse('Sign out success',$data=auth()->user(),Response::HTTP_OK,true);
    }

    /**
     * Get the token array structure.
     *
     * @param  string $token
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function createNewToken($token){
        $data['token'] = $token;
        $data['token_type'] = 'bearer';
        $data['expires_in'] = JWTAuth::factory()->getTTL() * 60;
        $data['user'] = auth()->user();
        return $this->apiResponse('success',$data,Response::HTTP_OK,true);
    }

    public function forgotPassword(Request $request)
{
    $request->validate(['email' => 'required|email|exists:users,email']);

    $email = $request->email;
    $token = Str::random(64);

    DB::table('password_resets')->updateOrInsert(
        ['email' => $email],
        ['token' => $token, 'created_at' => Carbon::now()]
    );

    $user = User::where('email', $email)->first();
    $hashEmail = Crypt::encryptString($email);
$link = "http://localhost:3000/change-password?email={$hashEmail}&token={$token}";

    $payload = [
        'name'      => $user->name ?? 'bạn',
        'token'     => $token,
        'hashEmail' => $hashEmail,
        'link'      => $link,
    ];

    Mail::to($email)->queue(new PasswordResetMail($payload));

    return response()->json(['status'=>true,'message'=>'Đã gửi email đặt lại mật khẩu']);
}

    public function resetPassword(Request $request)
    {
        $v = Validator::make($request->all(), [
            'email'                 => 'required|string', // email đã mã hoá
            'token'                 => 'required|string',
            'password'              => 'required|string|confirmed|min:6',
        ]);

        if ($v->fails()) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors'  => $v->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $decryptedEmail = Crypt::decryptString($request->email);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Email không hợp lệ'], Response::HTTP_BAD_REQUEST);
        }

        $record = DB::table('password_resets')
            ->where('email', $decryptedEmail)
            ->where('token', $request->token)
            ->first();

        if (!$record) {
            return response()->json(['message' => 'Token hoặc email không hợp lệ'], Response::HTTP_BAD_REQUEST);
        }

        // (Khuyến nghị) hết hạn sau 60 phút
        if (Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            return response()->json(['message' => 'Token đã hết hạn'], Response::HTTP_BAD_REQUEST);
        }

        $user = User::where('email', $decryptedEmail)->first();
        if (!$user) {
            return response()->json(['message' => 'Không tìm thấy người dùng'], Response::HTTP_NOT_FOUND);
        }

        $user->update(['password' => Hash::make($request->password)]);
        DB::table('password_resets')->where('email', $decryptedEmail)->delete();

        return response()->json(['message' => 'Đổi mật khẩu thành công'], Response::HTTP_OK);
    }
    public function changePassword(Request $request)
{
    $request->validate([
        'old_password'          => 'required|string',
        'password'              => 'required|string|confirmed|min:6',
    ]);

    // Lấy user từ JWT
    $user = auth('api')->user(); // hoặc JWTAuth::parseToken()->authenticate();
    if (!$user) {
        return response()->json(['status'=>false, 'message'=>'unauthenticated'], 401);
    }

    // Kiểm tra mật khẩu cũ
    if (!Hash::check($request->old_password, $user->password)) {
        return response()->json(['status'=>false, 'message'=>'old_password_incorrect'], 422);
    }

    // (Tuỳ chọn) Không cho đặt trùng như cũ
    if (Hash::check($request->password, $user->password)) {
        return response()->json(['status'=>false, 'message'=>'new_password_same_as_old'], 422);
    }

    // Cập nhật
    $user->password = Hash::make($request->password);
    $user->save();

    // (Gợi ý) Yêu cầu user đăng nhập lại để lấy JWT mới
    return response()->json(['status'=>true, 'message'=>'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.'], 200);
}

}
