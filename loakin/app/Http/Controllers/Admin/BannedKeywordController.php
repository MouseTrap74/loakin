<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BannedKeyword;
use Illuminate\Http\Request;

class BannedKeywordController extends Controller
{
    // Daftar semua kata kunci terlarang
    public function index()
    {
        $keywords = BannedKeyword::with('creator:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($keywords);
    }

    // Tambah kata kunci terlarang
    public function store(Request $request)
    {
        $request->validate([
            'keyword' => 'required|string|max:100|unique:banned_keywords,keyword',
        ]);

        $keyword = BannedKeyword::create([
            'keyword'    => strtolower($request->keyword),
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Kata kunci berhasil ditambahkan',
            'data'    => $keyword,
        ], 201);
    }

    // Hapus kata kunci terlarang
    public function destroy($id)
    {
        $keyword = BannedKeyword::findOrFail($id);
        $keyword->delete();

        return response()->json(['message' => 'Kata kunci berhasil dihapus']);
    }
}