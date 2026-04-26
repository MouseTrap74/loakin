<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    // Daftar semua pengguna
    public function index(Request $request)
    {
        $query = User::query();

        // Filter berdasarkan status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter berdasarkan role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Search berdasarkan nama atau email
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($users);
    }

    // Detail pengguna
    public function show($id)
    {
        $user = User::withTrashed()->findOrFail($id);

        return response()->json($user);
    }

    // Suspend akun
    public function suspend($id)
    {
        $user = User::findOrFail($id);

        if ($user->isAdmin()) {
            return response()->json(['message' => 'Tidak dapat mensuspend akun admin'], 403);
        }

        $user->update(['status' => 'suspended']);

        return response()->json(['message' => 'Akun berhasil disuspend']);
    }

    // Aktifkan kembali akun
    public function activate($id)
    {
        $user = User::findOrFail($id);
        $user->update(['status' => 'active']);

        return response()->json(['message' => 'Akun berhasil diaktifkan']);
    }

    // Hapus akun (soft-delete)
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if ($user->isAdmin()) {
            return response()->json(['message' => 'Tidak dapat menghapus akun admin'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'Akun berhasil dihapus']);
    }
}