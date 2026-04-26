<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    // Ambil data profil + alamat user yang sedang login
    public function show(Request $request)
    {
        $user = $request->user()->load('addresses');
        return response()->json($user);
    }

    // Edit profil
    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name'       => 'sometimes|nullable|string|max:255',
            'phone'      => 'sometimes|nullable|string|max:20',
            'bio'        => 'sometimes|nullable|string|max:500',
            'photo'      => 'sometimes|nullable|image|mimes:jpg,jpeg,png|max:10240',
            'birth_date' => 'sometimes|nullable|date',
            'gender'     => 'sometimes|nullable|in:Laki-Laki,Perempuan',
        ]);

        if ($request->hasFile('photo')) {
            if ($user->photo) {
                Storage::disk('public')->delete($user->photo);
            }
            $path = $request->file('photo')->store('photos/profiles', 'public');
            $user->photo = $path;
        }

        $user->fill($request->only(['name', 'phone', 'bio', 'birth_date', 'gender']));
        $user->save();
        $user->refresh();
        $user->load('addresses');

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user'    => $user,
        ]);
    }

    // Ganti kata sandi
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Kata sandi lama tidak sesuai'], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Kata sandi berhasil diperbarui']);
    }
}