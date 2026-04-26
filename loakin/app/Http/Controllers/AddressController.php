<?php

namespace App\Http\Controllers;

use App\Models\UserAddress;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    // Ambil semua alamat user
    public function index(Request $request)
    {
        $addresses = $request->user()->addresses()->orderBy('is_primary', 'desc')->get();
        return response()->json($addresses);
    }

    // Tambah alamat baru
    public function store(Request $request)
    {
        $request->validate([
            'label'          => 'required|string|max:50',
            'recipient_name' => 'required|string|max:255',
            'address'        => 'required|string',
            'note'           => 'nullable|string|max:255',
            'is_primary'     => 'boolean',
        ]);

        $user = $request->user();

        // Cek batas maksimum 5 alamat
        if ($user->addresses()->count() >= 5) {
            return response()->json(['message' => 'Maksimum 5 alamat telah tercapai'], 422);
        }

        // Kalau is_primary true, reset semua alamat lain jadi false dulu
        if ($request->is_primary) {
            $user->addresses()->update(['is_primary' => false]);
        }

        // Kalau ini alamat pertama, otomatis jadi primary
        $isPrimary = $request->is_primary || $user->addresses()->count() === 0;

        $address = UserAddress::create([
            'user_id'        => $user->id,
            'label'          => $request->label,
            'recipient_name' => $request->recipient_name,
            'address'        => $request->address,
            'note'           => $request->note,
            'is_primary'     => $isPrimary,
        ]);

        return response()->json([
            'message' => 'Alamat berhasil ditambahkan',
            'data'    => $address,
        ], 201);
    }

    // Update alamat
    public function update(Request $request, $id)
    {
        $address = UserAddress::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $request->validate([
            'label'          => 'sometimes|string|max:50',
            'recipient_name' => 'sometimes|string|max:255',
            'address'        => 'sometimes|string',
            'note'           => 'nullable|string|max:255',
            'is_primary'     => 'boolean',
        ]);

        // Kalau is_primary true, reset semua alamat lain dulu
        if ($request->is_primary) {
            $request->user()->addresses()->update(['is_primary' => false]);
        }

        $address->update($request->only(['label', 'recipient_name', 'address', 'note', 'is_primary']));

        return response()->json([
            'message' => 'Alamat berhasil diperbarui',
            'data'    => $address,
        ]);
    }

    // Hapus alamat
    public function destroy(Request $request, $id)
    {
        $address = UserAddress::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $address->delete();

        return response()->json(['message' => 'Alamat berhasil dihapus']);
    }
}