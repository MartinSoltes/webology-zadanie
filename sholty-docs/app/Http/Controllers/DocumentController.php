<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Document;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    //GET /api/documents
    public function index(Request $request)
    {
        $tag = $request->query('tag');

        $documents = Document::where('user_id', Auth::id())
            ->when($tag, fn($query) => $query->where('tag', $tag))
            ->paginate(10);

        return response()->json($documents);
    }

    //POST /api/documents
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'tag' => 'nullable|string|max:100',
            'file' => 'required|file|max:10240', // max 10MB
        ]);

        $filePath = $request->file('file')->store('documents/' . Auth::id(), 'public');

        $document = Document::create([
            'user_id' => Auth::id(),
            'name' => $request->name,
            'tag' => $request->tag,
            'file_path' => $filePath,
        ]);

        return response()->json($document, 201);
    }

    //PUT /api/documents/{id}
    public function update(Request $request, $id)
    {
        $document = Document::where('user_id', Auth::id())->findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'tag' => 'sometimes|nullable|string|max:100',
        ]);

        $document->update([
            'name' => $request->name,
            'tag' => $request->tag
        ]);

        return response()->json($document);;
    }   

    //DELETE /api/documents/{id}
    public function destroy($id)
    {
        $document = Document::where('user_id', Auth::id())->findOrFail($id);

        Storage::disk('public')->delete($document->file_path);
        $document->delete();

        return response()->json(['message' => 'Document deleted']);
    }

    //GET /api/documents/{id}/download
    public function download($id)
    {
        $document = Document::where('user_id', Auth::id())->findOrFail($id);
        return Storage::disk('public')->download($document->file_path);
    }
}