<?php

namespace App\Http\Controllers;

use App\Models\BlockedUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BlockedUserController extends Controller
{
    // Blokir user
    public function block(Request $request, $userId)
    {
        // Tidak boleh blokir diri sendiri
        if ((int)$userId === Auth::id()) {
            return response()->json(['message' => 'Tidak bisa memblokir diri sendiri'], 403);
        }

        // Cek apakah sudah diblokir
        $existing = BlockedUser::where('user_id', Auth::id())
            ->where('blocked_id', $userId)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Pengguna sudah diblokir'], 422);
        }

        BlockedUser::create([
            'user_id'    => Auth::id(),
            'blocked_id' => $userId,
        ]);

        return response()->json(['message' => 'Pengguna berhasil diblokir'], 201);
    }

    // Buka blokir user
    public function unblock($userId)
    {
        $blocked = BlockedUser::where('user_id', Auth::id())
            ->where('blocked_id', $userId)
            ->first();

        if (!$blocked) {
            return response()->json(['message' => 'Pengguna tidak ada dalam daftar blokir'], 404);
        }

        $blocked->delete();

        return response()->json(['message' => 'Blokir berhasil dibuka']);
    }

    // Lihat daftar user yang diblokir
    public function index()
    {
        $blocked = BlockedUser::with('blocked')
            ->where('user_id', Auth::id())
            ->latest()
            ->get();

        return response()->json($blocked);
    }
}