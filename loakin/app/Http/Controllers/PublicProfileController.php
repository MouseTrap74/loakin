<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class PublicProfileController extends Controller
{
    public function show($id)
    {
        $user = User::select([
                'id', 'name', 'photo', 'bio', 'city', 'role', 'created_at'
            ])
            ->where('id', $id)
            ->where('status', 'active')
            ->firstOrFail();

        return response()->json($user);
    }
}