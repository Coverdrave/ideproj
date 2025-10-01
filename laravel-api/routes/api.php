<?php

use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\UniClassController;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::get('/', function () {
    return 'API';
});

// Route::apiResource('schedule', ScheduleController::class);

Route::get('/schedule', [ScheduleController::class, 'index']);
Route::get('/schedule/all', [ScheduleController::class, 'all']);
Route::post('/schedule/create', [ScheduleController::class, 'create']);

Route::get('/subject/all', [SubjectController::class, 'all']);
Route::post('/subject/create', [SubjectController::class, 'create']);

Route::get('/uni_class/get_compatible_classes', [UniClassController::class, 'get_compatible_classes']);
Route::post('/uni_class/create', [UniClassController::class, 'create']);
Route::post('/uni_class/assign_to_schedules', [UniClassController::class, 'assign_to_schedules']);