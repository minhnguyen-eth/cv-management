<?php

namespace App\Http\Controllers;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;


class DepartmentController extends Controller
{
// Optional: bật auth nếu cần
// public function __construct()
// {
// $this->middleware('auth:sanctum');
// }


public function index(Request $request)
{
// Có thể thêm pagination nếu muốn: Department::latest()->paginate(20)
$items = Department::query()
->when($request->q, fn($q) => $q->where('name', 'like', "%{$request->q}%"))
->latest('id')
->get();


return response()->json(['data' => $items]);
}


public function store(Request $request)
{
$data = $request->validate([
'name' => ['required','string','max:255','unique:departments,name'],
'description' => ['nullable','string']
]);


$item = Department::create($data);
return response()->json(['data' => $item], Response::HTTP_CREATED);
}


public function show(Department $department)
{
return response()->json(['data' => $department]);
}


public function update(Request $request, Department $department)
{
$data = $request->validate([
'name' => ['required','string','max:255', Rule::unique('departments','name')->ignore($department->id)],
'description' => ['nullable','string']
]);


$department->update($data);
return response()->json(['data' => $department]);
}


public function destroy(Department $department)
{
    $department->delete(); // soft delete
    return response()->json([], 204);
}
}