<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Subject;

class SubjectController extends Controller
{
    public function all() {
        return Subject::select('name')->get();
    }

    public function create(Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|unique:subjects|max:255'
        ]);

        $subject = Subject::create($validated);

        return response()->json([
            'message' => 'Успешно създаване',
        ], 201);
    }
}
