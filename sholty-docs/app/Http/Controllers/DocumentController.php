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
        $tags = $request->query('tags');

        $query = Document::where('user_id', Auth::id());

        if ($tags) {
            $tagArray = explode(',', $tags);

            $query->where(function($q) use ($tagArray) {
                foreach ($tagArray as $t) {
                    $q->whereJsonContains('tags', $t);
                }
            });
        }

        return $query->paginate(10);
    }

    //POST /api/documents
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:100',
            'file' => 'required|file|max:10240', // max 10MB
        ]);

        $filePath = $request->file('file')->store('documents/' . Auth::id(), 'public');

        $document = Document::create([
            'user_id' => Auth::id(),
            'name' => $request->name,
            'tags' => $request->tags ?? [],
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
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:100',
        ]);

        $document->update([
            'name' => $request->name,
            'tags' => $request->tags ?? [],
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

        if (!Storage::disk('public')->exists($document->file_path)) {
            return response()->json(['error' => 'File not found'], 404);
        }

        return Storage::disk('public')->download($document->file_path);
    }

    // GET /api/documents/{id}
    public function show($id)
    {
        $document = Document::where('user_id', Auth::id())->findOrFail($id);
        return response()->json($document);
    }

    // GET /api/documents-tags
    public function tags()
    {
        $tags = Document::where('user_id', Auth::id())
            ->pluck('tags')      // zoberie zo všetkých dokumentov pole tagov
            ->flatten()          // rozbalí na 1D array
            ->filter()           // odstráni null a empty
            ->unique()
            ->values();

        return response()->json($tags);
    }

}