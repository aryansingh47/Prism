"""Fictional regression checks — not PRISM study results."""
import csv
import tempfile
import unittest
from pathlib import Path
from sys import path as pythonpath

pythonpath.insert(0, str(Path(__file__).resolve().parents[1] / 'analysis'))
from analyse_sus import sus_score, score_sus_csv, task_summary  # noqa: E402


class SUSScoringTest(unittest.TestCase):
    def test_maximum_and_minimum(self):
        self.assertEqual(sus_score([5, 1] * 5), 100.0)
        self.assertEqual(sus_score([1, 5] * 5), 0.0)

    def test_neutral_and_seventy_five(self):
        self.assertEqual(sus_score([3] * 10), 50.0)
        self.assertEqual(sus_score([4, 2] * 5), 75.0)

    def test_invalid_inputs(self):
        with self.assertRaises(ValueError):
            sus_score([5, 1] * 4)
        with self.assertRaises(ValueError):
            sus_score([5, 1] * 4 + [6, 1])
        with self.assertRaises(ValueError):
            sus_score([True] * 10)

    def test_csv_validation_and_score(self):
        with tempfile.TemporaryDirectory() as directory:
            csv_path = Path(directory) / 'sus.csv'
            fields = ['participant_id'] + [f'SUS{i:02d}' for i in range(1, 11)]
            with csv_path.open('w', newline='', encoding='utf-8') as file:
                writer = csv.DictWriter(file, fieldnames=fields)
                writer.writeheader()
                writer.writerow(dict(zip(fields, ['P001'] + [4, 2] * 5)))
            report = score_sus_csv(csv_path)
            self.assertEqual(report['summary']['mean'], 75.0)
            self.assertEqual(report['summary']['n'], 1)
            with csv_path.open('a', newline='', encoding='utf-8') as file:
                writer = csv.DictWriter(file, fieldnames=fields)
                writer.writerow(dict(zip(fields, ['P001'] + [3] * 10)))
            with self.assertRaisesRegex(ValueError, 'duplicate'):
                score_sus_csv(csv_path)

    def test_task_summary(self):
        with tempfile.TemporaryDirectory() as directory:
            csv_path = Path(directory) / 'tasks.csv'
            fields = ['participant_id', 'task_id', 'status', 'seconds', 'hint_level']
            with csv_path.open('w', newline='', encoding='utf-8') as file:
                writer = csv.DictWriter(file, fieldnames=fields)
                writer.writeheader()
                writer.writerow(dict(zip(fields, ['P001', 'T01', 'success_unassisted', '47', 'H0'])))
                writer.writerow(dict(zip(fields, ['P002', 'T01', 'success_assisted', '83', 'H1'])))
                writer.writerow(dict(zip(fields, ['P003', 'T01', 'not_evaluable', '', 'H0'])))
            report = task_summary(csv_path)
            self.assertEqual(report['tasks']['T01']['evaluable'], 2)
            self.assertEqual(report['tasks']['T01']['unaided_success_rate'], 0.5)
            self.assertEqual(report['tasks']['T01']['median_successful_seconds'], 65)


if __name__ == '__main__':
    unittest.main()
