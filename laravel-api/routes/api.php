<?php

use App\Http\Controllers\ScheduleController;
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