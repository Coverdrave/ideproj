<?php

namespace App\CustomFunctions;

class ConstraintSatisfaction {
    protected array $variables;
    protected array $domains;
    protected array $constraints;

    public function __construct(array $variables, array $domains) {
        $this->variables = $variables;
        $this->domains = $domains;
    }

    public function backtracking_search(array $assignment = []) {
        if (count($assignment) == count($this->variables))
            return $assignment;

        $unassigned = [];
        foreach ($this->variables as $var) {
            if (!array_key_exists($var, $assignment))
                $unassigned[] = $var;
        }

        // $var = $unassigned[0];
        $var = array_reduce(
            $unassigned,
            fn ($best, $v) =>
                $best === null || count($this->domains[$v]) < count($this->domains[$best])
                    ? $v
                    : $best
        );
        $values = $this->domains[$var];

        foreach ($values as $value) {
            $local_assignment = $assignment;
            $local_assignment[$var] = $value;

            if ($this->hard_constraints($var, $local_assignment)) {
                $result = $this->backtracking_search($local_assignment);
                
                if ($result != null)
                    return $result;
            }
        }

        return null;
    }

    private function hard_constraints($var1, $assignment) : bool {
        [$var1_subgroup, $var1_subjectid, $var1_lect_or_exer] = explode("_", $var1);
        $var1_val = $assignment[$var1];

        //lecture before exercise

        foreach ($assignment as $var2 => $var2_val) {
            if ($var2 === $var1) continue;

            [$var2_subgroup, $var2_subjectid, $var2_lect_or_exer] = explode("_", $var2);

            if (
                $var1_subjectid === $var2_subjectid &&
                $var1_lect_or_exer === 'lecture' &&
                $var2_lect_or_exer === 'lecture'
            ) {
                if (
                    $var1_val['day'] !== $var2_val['day'] ||
                    $var1_val['hour'] !== $var2_val['hour'] ||
                    $var1_val['week'] !== $var2_val['week']
                ) {
                    return false;
                }
            }

            
            if (
                $var1_val["day"] == $var2_val["day"] &&
                $var1_val["hour"] == $var2_val["hour"] &&
                $this->weeksOverlap($var1_val["week"], $var2_val["week"])
            ) {
                // SAME SUBJECT LECTURE (allowed)
                if (
                    $var1_subjectid === $var2_subjectid &&
                    $var1_lect_or_exer === 'lecture' &&
                    $var2_lect_or_exer === 'lecture'
                ) {
                    continue;
                }

                // SAME SUBJECT EXERCISE (forbidden)
                if (
                    $var1_subjectid === $var2_subjectid &&
                    $var1_lect_or_exer === 'exercise' &&
                    $var2_lect_or_exer === 'exercise'
                ) {
                    return false;
                }

                // SAME SUBGROUP always forbidden
                if ($var1_subgroup === $var2_subgroup) {
                    return false;
                }

                // LECTURE blocks everything else
                if (
                    $var1_lect_or_exer === 'lecture' ||
                    $var2_lect_or_exer === 'lecture'
                ) {
                    return false;
                }
            }

            // lecture must be before exercise (same subject & subgroup)
            if ($var1_subjectid === $var2_subjectid &&
                $var1_subgroup === $var2_subgroup
            ) {
                if (
                    $var1_lect_or_exer === 'lecture' &&
                    $var2_lect_or_exer === 'exercise' &&
                    !$this->isBefore($var1_val, $var2_val)
                ) {
                    return false;
                }

                if (
                    $var1_lect_or_exer === 'exercise' &&
                    $var2_lect_or_exer === 'lecture' &&
                    !$this->isBefore($var2_val, $var1_val)
                ) {
                    return false;
                }
            }


        }

        return true;
    }

    private function weeksOverlap(string $w1, string $w2): bool {
        if ($w1 === 'every' || $w2 === 'every') return true;
        return $w1 === $w2;
    }

    private function isBefore(array $a, array $b): bool {
        return
            $a['day'] < $b['day'] ||
            ($a['day'] === $b['day'] && $a['hour'] < $b['hour']);
    }

}