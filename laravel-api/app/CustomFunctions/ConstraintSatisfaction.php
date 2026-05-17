<?php

namespace App\CustomFunctions;

class ConstraintSatisfaction {
    protected array $variables;
    protected array $domains;
    protected ?array $bestAssignment = null;
    protected int $minGaps = 999; // Start with a high number   

    public function __construct(array $variables, array $domains) {
        $this->variables = $variables;
        $this->domains = $domains;
    }

    private function countGaps(array $assignment): int {
        $gaps = 0;
        $groups = [];

        // Group hours by subgroup and day
        foreach ($assignment as $var => $val) {
            $subgroup = explode("_", $var)[0];
            $groups[$subgroup][$val['day']][] = [
                'start' => $val['hour'],
                'duration' => $val['duration']
            ];
        }

        foreach ($groups as $days) {
            foreach ($days as $hours) {
                if (count($hours) < 2) continue;
                
                usort($hours, function ($a, $b) {
                    return $a['start'] <=> $b['start'];
                });

                $last_class = end($hours);
                $last_class_end = $last_class['start'] + $last_class['duration'];
                $day_span = $last_class_end - $hours[0]['start'];
                $class_time = 0;
                foreach ($hours as $class) {
                    $class_time += $class['duration'];
                }

                $gaps += max(0, $day_span - $class_time);
            }
        }
        return $gaps;
    }

    public function solve() {
        $this->backtracking_search([]);
        return $this->bestAssignment;
    }

    public function backtracking_search(array $assignment = []) {
        // 1. Goal State: If full, check if this is our best one yet
        if (count($assignment) == count($this->variables)) {
            $currentGaps = $this->countGaps($assignment);
            if ($currentGaps < $this->minGaps) {
                $this->minGaps = $currentGaps;
                $this->bestAssignment = $assignment;
            }
            // If we found a perfect schedule (0 gaps), we can stop entirely
            return $this->minGaps === 0 ? $assignment : null;
        }

        // 2. Select Variable (MRV)
        $unassigned = array_values(array_diff($this->variables, array_keys($assignment)));
        $var = array_reduce($unassigned, fn($b, $v) => 
            $b === null || count($this->domains[$v]) < count($this->domains[$b]) ? $v : $b
        );

        $values = $this->domains[$var];

        // 3. VALUE ORDERING (The Magic)
        // Sort values: Try hours that result in fewer gaps first
        usort($values, function($a, $b) use ($var, $assignment) {
            return $this->getGapCost($var, $a, $assignment) <=> $this->getGapCost($var, $b, $assignment);
        });

        foreach ($values as $value) {
            $assignment[$var] = $value;

            if ($this->hard_constraints($var, $assignment)) {
                // OPTIONAL: "Bounding" - if current partial gaps > minGaps, stop this branch
                if ($this->countGaps($assignment) < $this->minGaps) {
                    $this->backtracking_search($assignment);
                }
            }
            unset($assignment[$var]); // Backtrack
            
            // If we already found a perfect 0-gap solution in a deeper branch, stop.
            if ($this->minGaps === 0) break;
        }

        return null;
    }

    // Helper for Value Ordering: returns distance to the closest class already scheduled
    private function getGapCost($var, $val, $assignment): int {
        $subgroup = explode("_", $var)[0];
        $costs = [99]; 
        foreach ($assignment as $aVar => $aVal) {
            if (explode("_", $aVar)[0] === $subgroup && $aVal['day'] === $val['day']) {
                $costs[] = abs($aVal['hour'] - $val['hour']);
            }
        }
        return min($costs);
    }

    private function hard_constraints($var1, $assignment) : bool {
        [$var1_subgroup, $var1_subjectid, $var1_lect_or_exer] = explode("_", $var1);
        $var1_val = $assignment[$var1];
        $var1_day = $var1_val['day'];
        $var1_hour = $var1_val['hour'];
        $var1_week = $var1_val['week'];
        $var1_lecturer = $var1_val['lecturer_id'];

        foreach ($assignment as $var2 => $var2_val) {
            if ($var2 === $var1) continue;

            [$var2_subgroup, $var2_subjectid, $var2_lect_or_exer] = explode("_", $var2);
            $var2_day = $var2_val['day'];
            $var2_hour = $var2_val['hour'];
            $var2_week = $var2_val['week'];
            $var2_lecturer = $var2_val['lecturer_id'];

            $same_time = ($var1_day == $var2_day &&
                $this->weeksOverlap($var1_week, $var2_week) &&
                $this->durationOverlap($var1_hour, $var1_val['duration'], $var2_hour, $var2_val['duration']));

            // If same subject and they're both lectures
            if ($var1_subjectid === $var2_subjectid &&
                $var1_lect_or_exer === 'lecture' &&
                $var2_lect_or_exer === 'lecture'
            ) {
                // Different times (forbidden)
                if (!$same_time) {
                    return false;
                }

                // Different lecturer (forbidden)
                if ($var1_lecturer !== $var2_lecturer) {
                    return false;
                }
            }

            // If held at the same time
            if ($same_time) {
                // SAME SUBJECT LECTURE (allowed)
                if ($var1_subjectid === $var2_subjectid &&
                    $var1_lect_or_exer === 'lecture' &&
                    $var2_lect_or_exer === 'lecture'
                ) {
                    continue;
                }

                // SAME SUBJECT EXERCISE (forbidden)
                if ($var1_subjectid === $var2_subjectid &&
                    $var1_lect_or_exer === 'exercise' &&
                    $var2_lect_or_exer === 'exercise' &&
                    $var1_lecturer === $var2_lecturer
                ) {
                    return false;
                }

                // SAME SUBGROUP always forbidden
                if ($var1_subgroup === $var2_subgroup) {
                    return false;
                }

                // LECTURE blocks everything else
                if ($var1_lect_or_exer === 'lecture' ||
                    $var2_lect_or_exer === 'lecture'
                ) {
                    return false;
                }
            }
        }

        return true;
    }

    private function durationOverlap(int $start1, int $duration1, int $start2, int $duration2) : bool {
        $end1 = $start1 + $duration1;
        $end2 = $start2 + $duration2;

        return ($start2 < $end1 && $end2 > $start1);
    }

    private function weeksOverlap(string $w1, string $w2): bool {
        if ($w1 === 'every' || $w2 === 'every') return true;
        return $w1 === $w2;
    }
}