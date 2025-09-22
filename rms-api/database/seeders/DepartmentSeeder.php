<?php
namespace Database\Seeders;


use Illuminate\Database\Seeder;
use App\Models\Department;


class DepartmentSeeder extends Seeder
{
public function run(): void
{
$data = [
['name' => 'Kỹ thuật', 'description' => 'Phát triển & vận hành'],
['name' => 'Nhân sự', 'description' => 'Tuyển dụng & văn hoá'],
['name' => 'Kinh doanh', 'description' => 'Bán hàng & đối tác'],
['name' => 'Marketing', 'description' => 'Truyền thông & thương hiệu'],
];
foreach ($data as $row) {
Department::firstOrCreate(['name' => $row['name']], $row);
}
}
}