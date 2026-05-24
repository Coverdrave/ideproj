<?php

use App\Http\Controllers\FacultyController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\SpecialtyController;
use App\Http\Controllers\StudentGroupController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\UniClassController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::get('/', function () {
    return 'API';
});

Route::get('/schedule', [ScheduleController::class, 'index']);
Route::get('/schedule/all', [ScheduleController::class, 'all']);
Route::post('/schedule/get_existing_subgroups/', [ScheduleController::class, 'get_existing_subgroups']);
Route::post('/schedule/create', [ScheduleController::class, 'create']);
Route::post('/schedule/generate', [ScheduleController::class, 'generate']);
Route::post('/schedule/save_generated', [ScheduleController::class, 'save_generated']);

Route::get('/subject/all', [SubjectController::class, 'all']);
Route::post('/subject/create', [SubjectController::class, 'create']);

Route::get('/uni_class/get_compatible_classes', [UniClassController::class, 'get_compatible_classes']);
Route::post('/uni_class/create', [UniClassController::class, 'create']);
Route::post('/uni_class/assign_to_schedules', [UniClassController::class, 'assign_to_schedules']);

Route::get('/faculty/all', [FacultyController::class, 'all']);
Route::get('/faculty/all_with_specialties', [FacultyController::class, 'all_with_specialties']);
Route::post('/faculty/create', [FacultyController::class, 'create']);
Route::put('/faculty/update/{faculty_id}', [FacultyController::class, 'update']);
Route::delete('/faculty/delete/{faculty_id}', [FacultyController::class, 'delete']);

Route::get('/specialty/{specialty_id}/semester_subjects/{semester}', [SpecialtyController::class, 'get_specialty_subjects_by_semester']);
Route::get('/specialty/all', [SpecialtyController::class, 'all']);
Route::post('/specialty/create', [SpecialtyController::class, 'create']);
Route::put('/specialty/update/{id}', [SpecialtyController::class, 'update']);
Route::delete('/specialty/delete/{id}', [SpecialtyController::class, 'delete']);

Route::get('/student_group/get_groups_subgroups/{specialty_id}/{semester}', [StudentGroupController::class, 'get_groups_subgroups']);