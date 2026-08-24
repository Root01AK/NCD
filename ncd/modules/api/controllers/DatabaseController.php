<?php

namespace app\modules\api\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use bizley\jwt\JwtHttpBearerAuth;

class DatabaseController extends Controller
{
    public $enableCsrfValidation = false;

    public function behaviors()
    {
        $behaviors = parent::behaviors();
        
        $behaviors['contentNegotiator'] = [
            'class' => \yii\filters\ContentNegotiator::class,
            'formats' => [
                'application/json' => Response::FORMAT_JSON,
            ],
        ];

        unset($behaviors['authenticator']);

        // CORS Setup
        $behaviors['corsFilter'] = [
            'class' => \yii\filters\Cors::class,
            'cors' => [
                'Origin' => ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178', 'http://localhost:5179', 'http://localhost:5180'],
                'Access-Control-Request-Method' => ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
                'Access-Control-Request-Headers' => ['*'],
                'Access-Control-Allow-Credentials' => true,
                'Access-Control-Max-Age' => 3600,
                'Access-Control-Expose-Headers' => ['*'],
            ],
        ];

        $behaviors['authenticator'] = [
            'class' => JwtHttpBearerAuth::class,
            'optional' => ['options', 'tables', 'tabledata', 'updaterecord', 'deleterecord', 'createrecord', 'flushtable', 'seeddata'],
        ];

        return $behaviors;
    }

    public function actionOptions()
    {
        Yii::$app->getResponse()->setStatusCode(200);
    }

    /**
     * Helper to get database connection by location (Dharavi, Malvani, Vashi, or Central)
     */
    private function getDbConnection($loc = null)
    {
        $locKey = strtolower(trim((string)$loc));
        $host = getenv('DB_HOST') ?: '127.0.0.1';
        $user = getenv('DB_USER') ?: 'root';
        $pass = getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : 'Kirub@2001';

        if ($locKey === 'dharavi') {
            try {
                $dbName = getenv('DB_NAME_DHARAVI') ?: 'ncd_dharavi';
                $conn = new \yii\db\Connection([
                    'dsn' => "mysql:host={$host};dbname={$dbName}",
                    'username' => $user,
                    'password' => $pass,
                    'charset' => 'utf8',
                    'tablePrefix' => 'cms_',
                ]);
                $conn->open();
                return [$conn, 'Dharavi', $dbName];
            } catch (\Exception $e) {
                return [Yii::$app->db, 'Dharavi', 'ncd'];
            }
        }

        if ($locKey === 'malvani') {
            try {
                $dbName = getenv('DB_NAME_MALVANI') ?: 'ncd_malvani';
                $conn = new \yii\db\Connection([
                    'dsn' => "mysql:host={$host};dbname={$dbName}",
                    'username' => $user,
                    'password' => $pass,
                    'charset' => 'utf8',
                    'tablePrefix' => 'cms_',
                ]);
                $conn->open();
                return [$conn, 'Malvani', $dbName];
            } catch (\Exception $e) {
                return [Yii::$app->db, 'Malvani', 'ncd'];
            }
        }

        if ($locKey === 'vashi') {
            try {
                $dbName = getenv('DB_NAME_VASHI') ?: 'ncd_vashi';
                $conn = new \yii\db\Connection([
                    'dsn' => "mysql:host={$host};dbname={$dbName}",
                    'username' => $user,
                    'password' => $pass,
                    'charset' => 'utf8',
                    'tablePrefix' => 'cms_',
                ]);
                $conn->open();
                return [$conn, 'Vashi', $dbName];
            } catch (\Exception $e) {
                return [Yii::$app->db, 'Vashi', 'ncd'];
            }
        }

        return [Yii::$app->db, 'Central DB', 'ncd'];
    }

    /**
     * GET /api/v1/database/tables?location=dharavi
     * Returns list of database tables with row counts for selected location DB
     */
    public function actionTables()
    {
        $location = Yii::$app->request->get('location', 'central');
        list($db, $locName, $dbName) = $this->getDbConnection($location);

        $tableNames = [
            'cms_mdhl' => ['label' => 'Initial Screening Records', 'pk' => 'mem_scrn_id', 'group' => 'Screening'],
            'cms_users' => ['label' => 'System Accounts & Staff', 'pk' => 'id', 'group' => 'Core'],
            'cms_locationmaster' => ['label' => 'Locations & Centers', 'pk' => 'id', 'group' => 'Core'],
            'cms_surveymaster' => ['label' => 'Surveys & Form Schemas', 'pk' => 'sur_id', 'group' => 'Core'],
            'cms_apm' => ['label' => 'Anthropometry (Height/Weight)', 'pk' => 'apm_id', 'group' => 'Clinical'],
            'cms_vital' => ['label' => 'Blood Pressure & Vitals', 'pk' => 'vital_id', 'group' => 'Clinical'],
            'cms_bsr' => ['label' => 'Blood Sugar & RBS', 'pk' => 'bsr_id', 'group' => 'Clinical'],
            'cms_ce' => ['label' => 'Clinical Exams', 'pk' => 'ce_id', 'group' => 'Clinical'],
            'cms_cml' => ['label' => 'Case Management Linkages', 'pk' => 'cml_id', 'group' => 'Clinical'],
            'cms_cprca' => ['label' => 'Community Perception', 'pk' => 'cprca_id', 'group' => 'Clinical'],
            'cms_dg' => ['label' => 'Diagnosis Records', 'pk' => 'dg_id', 'group' => 'Clinical'],
            'cms_fupm' => ['label' => 'Follow up Management', 'pk' => 'fupm_id', 'group' => 'Clinical'],
            'cms_mortalityform' => ['label' => 'Mortality Records', 'pk' => 'id', 'group' => 'Clinical'],
            'cms_trackingform' => ['label' => 'Tracking Records', 'pk' => 'id', 'group' => 'Clinical'],
        ];

        $results = [];
        foreach ($tableNames as $tName => $meta) {
            try {
                $query = (new \yii\db\Query())->from($tName);
                if ($locName !== 'Central DB' && $tName === 'cms_mdhl') {
                    $query->where(['like', 'mem_scrn_q17', $locName]);
                }
                $count = $query->count('*', $db);
            } catch (\Exception $e) {
                $count = 0;
            }

            $results[] = [
                'table' => $tName,
                'label' => $meta['label'],
                'primaryKey' => $meta['pk'],
                'group' => $meta['group'],
                'rowCount' => (int)$count
            ];
        }

        return [
            'status' => 'success',
            'location' => $location,
            'database' => $dbName,
            'tables' => $results
        ];
    }

    /**
     * GET /api/v1/database/tabledata?table=cms_mdhl&location=dharavi
     * Returns rows and column definitions for a given table in selected location DB
     */
    public function actionTabledata()
    {
        $request = Yii::$app->request;
        $table = $request->get('table', 'cms_mdhl');
        $location = $request->get('location', 'central');
        $limit = (int)$request->get('limit', 150);
        $search = $request->get('search', '');

        $allowed = ['cms_mdhl', 'cms_users', 'cms_locationmaster', 'cms_surveymaster', 'cms_apm', 'cms_vital', 'cms_bsr', 'cms_ce', 'cms_cml', 'cms_cprca', 'cms_dg', 'cms_fupm', 'cms_mortalityform', 'cms_trackingform'];
        if (!in_array($table, $allowed)) {
            Yii::$app->response->statusCode = 400;
            return ['status' => 'error', 'message' => 'Invalid table specified'];
        }

        list($db, $locName, $dbName) = $this->getDbConnection($location);

        try {
            $schema = $db->getTableSchema($table);
            $columns = $schema ? array_keys($schema->columns) : [];
            $pk = $schema ? ($schema->primaryKey[0] ?? 'id') : 'id';

            $query = (new \yii\db\Query())->from($table);

            // Filter location-specific records if fallback DB is used
            if ($locName !== 'Central DB' && $table === 'cms_mdhl') {
                $query->andWhere(['like', 'mem_scrn_q17', $locName]);
            }

            if (!empty($search)) {
                $conditions = ['or'];
                foreach ($columns as $col) {
                    $conditions[] = ['like', $col, $search];
                }
                $query->andWhere($conditions);
            }

            $rows = $query->orderBy([$pk => SORT_DESC])->limit($limit)->all($db);

            return [
                'status' => 'success',
                'table' => $table,
                'location' => $location,
                'database' => $dbName,
                'primaryKey' => $pk,
                'columns' => $columns,
                'data' => $rows
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * POST /api/v1/database/updaterecord
     */
    public function actionUpdaterecord()
    {
        $request = Yii::$app->request;
        $payload = $request->getBodyParams();

        $table = $payload['table'] ?? null;
        $location = $payload['location'] ?? 'central';
        $pk = $payload['primaryKey'] ?? 'id';
        $pv = $payload['primaryValue'] ?? null;
        $data = $payload['data'] ?? [];

        if (!$table || !$pv || empty($data)) {
            Yii::$app->response->statusCode = 400;
            return ['status' => 'error', 'message' => 'Table, primary value, and data required'];
        }

        list($db, $locName, $dbName) = $this->getDbConnection($location);

        try {
            unset($data[$pk]);
            $db->createCommand()->update($table, $data, [$pk => $pv])->execute();

            return [
                'status' => 'success',
                'database' => $dbName,
                'message' => "Record in $table ($dbName) updated successfully."
            ];
        } catch (\Exception $e) {
            Yii::$app->response->statusCode = 500;
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    /**
     * POST /api/v1/database/deleterecord
     */
    public function actionDeleterecord()
    {
        $request = Yii::$app->request;
        $payload = $request->getBodyParams();

        $table = $payload['table'] ?? null;
        $location = $payload['location'] ?? 'central';
        $pk = $payload['primaryKey'] ?? 'id';
        $pv = $payload['primaryValue'] ?? null;

        if (!$table || !$pv) {
            Yii::$app->response->statusCode = 400;
            return ['status' => 'error', 'message' => 'Table and primary value required'];
        }

        list($db, $locName, $dbName) = $this->getDbConnection($location);

        try {
            $db->createCommand()->delete($table, [$pk => $pv])->execute();

            return [
                'status' => 'success',
                'database' => $dbName,
                'message' => "Record deleted from $table in $dbName."
            ];
        } catch (\Exception $e) {
            Yii::$app->response->statusCode = 500;
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    /**
     * POST /api/v1/database/createrecord
     */
    public function actionCreaterecord()
    {
        $request = Yii::$app->request;
        $payload = $request->getBodyParams();

        $table = $payload['table'] ?? null;
        $location = $payload['location'] ?? 'central';
        $data = $payload['data'] ?? [];

        if (!$table || empty($data)) {
            Yii::$app->response->statusCode = 400;
            return ['status' => 'error', 'message' => 'Table and insert data required'];
        }

        list($db, $locName, $dbName) = $this->getDbConnection($location);

        try {
            $db->createCommand()->insert($table, $data)->execute();
            $newId = $db->getLastInsertID();

            return [
                'status' => 'success',
                'database' => $dbName,
                'id' => $newId,
                'message' => "New record created in $table ($dbName)."
            ];
        } catch (\Exception $e) {
            Yii::$app->response->statusCode = 500;
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    /**
     * POST /api/v1/database/flushtable
     */
    public function actionFlushtable()
    {
        $request = Yii::$app->request;
        $payload = $request->getBodyParams();

        $table = $payload['table'] ?? null;
        $tables = $payload['tables'] ?? ($table ? [$table] : []);
        $location = $payload['location'] ?? 'central';

        if (empty($tables)) {
            Yii::$app->response->statusCode = 400;
            return ['status' => 'error', 'message' => 'Table name(s) required for flush action'];
        }

        list($db, $locName, $dbName) = $this->getDbConnection($location);

        $allowed = ['cms_mdhl', 'cms_apm', 'cms_vital', 'cms_bsr', 'cms_ce', 'cms_cml', 'cms_cprca', 'cms_dg', 'cms_fupm', 'cms_mortalityform', 'cms_trackingform'];

        try {
            $db->createCommand("SET FOREIGN_KEY_CHECKS = 0;")->execute();
            
            $flushed = [];
            foreach ($tables as $t) {
                if (in_array($t, $allowed)) {
                    if ($locName !== 'Central DB' && $t === 'cms_mdhl') {
                        $db->createCommand()->delete($t, ['like', 'mem_scrn_q17', $locName])->execute();
                    } else {
                        $db->createCommand("TRUNCATE TABLE `$t`;")->execute();
                    }
                    $flushed[] = $t;
                }
            }
            
            $db->createCommand("SET FOREIGN_KEY_CHECKS = 1;")->execute();

            return [
                'status' => 'success',
                'database' => $dbName,
                'flushed' => $flushed,
                'message' => "Specified database tables in $dbName truncated successfully."
            ];
        } catch (\Exception $e) {
            Yii::$app->response->statusCode = 500;
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    /**
     * POST /api/v1/database/seeddata
     */
    public function actionSeeddata()
    {
        $request = Yii::$app->request;
        $payload = $request->getBodyParams();
        $location = $payload['location'] ?? 'central';

        list($db, $locName, $dbName) = $this->getDbConnection($location);

        $center = ($locName !== 'Central DB') ? $locName : 'Dharavi';
        $prefix = (strtoupper(substr($center, 0, 2)));

        try {
            $seeded = [];
            for ($i = 1; $i <= 5; $i++) {
                $num = sprintf("%04d", rand(100, 999));
                $pId = "NCD{$prefix}{$num}";

                $extraPayload = [
                    'fullName' => "Test {$center} Participant {$i}",
                    'age' => rand(30, 65),
                    'gender' => ($i % 2 === 0) ? 'Female' : 'Male',
                    'location' => $center,
                    'participant_id' => $pId,
                    'screening_date' => date('d-M-Y'),
                    'submitted_by_role' => 'Field Supervisor',
                    'submitted_by_user' => 'FS001'
                ];

                $db->createCommand()->insert('cms_mdhl', [
                    'mem_scrn_part_id' => $pId,
                    'mem_scrn_q1' => $extraPayload['age'],
                    'mem_scrn_q2' => ($extraPayload['gender'] === 'Male') ? '1' : '2',
                    'mem_scrn_q16' => $extraPayload['fullName'],
                    'mem_scrn_q17' => $center,
                    'mem_scrn_q24' => ($i === 2) ? 1 : 0,
                    'mem_scrn_q30' => json_encode($extraPayload)
                ])->execute();

                $seeded[] = $pId;
            }

            return [
                'status' => 'success',
                'database' => $dbName,
                'seeded' => $seeded,
                'message' => "Successfully seeded 5 test participant records into $dbName ($center)."
            ];
        } catch (\Exception $e) {
            Yii::$app->response->statusCode = 500;
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }
}
