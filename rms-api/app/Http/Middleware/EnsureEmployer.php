<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureEmployer
{
    public function handle(Request $request, Closure $next)
    {
        $user = auth('api')->user();
        if (!$user || $user->is_admin !== 1) {
            return response()->json(['message' => 'Forbidden (employer only)'], 403);
        }
        return $next($request);
    }
}
