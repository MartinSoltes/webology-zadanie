<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Ak už tags existuje, nebudeme ho znova pridávať
        if (!Schema::hasColumn('documents', 'tags')) {
            Schema::table('documents', function (Blueprint $table) {
                $table->json('tags')->nullable()->after('name');
            });
        }

        // Prenos dát zo starého 'tag' do 'tags'
        if (Schema::hasColumn('documents', 'tag')) {
            DB::table('documents')->get()->each(function ($doc) {
                if ($doc->tag) {
                    DB::table('documents')
                        ->where('id', $doc->id)
                        ->update([
                            'tags' => json_encode([$doc->tag])
                        ]);
                }
            });

            // Pokus o drop stĺpca 'tag'
            Schema::table('documents', function (Blueprint $table) {
                $table->dropColumn('tag');
            });
        }
    }

    public function down(): void
    {
        // Rollback nebude pridávať duplicitný stĺpec, iba ak neexistuje
        if (!Schema::hasColumn('documents', 'tag')) {
            Schema::table('documents', function (Blueprint $table) {
                $table->string('tag')->nullable();
            });
        }

        if (Schema::hasColumn('documents', 'tags')) {
            Schema::table('documents', function (Blueprint $table) {
                $table->dropColumn('tags');
            });
        }
    }
};
