<?php

namespace app\modules\api\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\Surveymaster;

class SurveymasterController extends Controller
{
    /**
     * Disable CSRF validation for REST API
     */
    public $enableCsrfValidation = false;

    /**
     * Setup Behaviors (CORS)
     */
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
                'Origin' => ['*'],
                'Access-Control-Request-Method' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                'Access-Control-Request-Headers' => ['*'],
                'Access-Control-Allow-Credentials' => true,
                'Access-Control-Max-Age' => 3600,
                'Access-Control-Expose-Headers' => ['*'],
            ],
        ];

        return $behaviors;
    }

    /**
     * Handle CORS preflight request
     */
    public function actionOptions()
    {
        Yii::$app->getResponse()->setStatusCode(200);
    }

    /**
     * Helper to safely extract JSON body parameters
     */
    private function getPayload()
    {
        $payload = [];
        try {
            $payload = Yii::$app->request->getBodyParams();
        } catch (\Throwable $e) {}

        if (empty($payload)) {
            $raw = Yii::$app->request->getRawBody();
            if (!empty($raw)) {
                $payload = json_decode($raw, true) ?: [];
            }
        }
        if (empty($payload)) {
            $payload = Yii::$app->request->post();
        }
        return $payload ?: [];
    }

    private function ensureTablesExist()
    {
        try {
            $db = Yii::$app->db;
            $db->open();
            
            // 1. Direct DDL to guarantee cms_surveymaster exists
            $createTableSql = "CREATE TABLE IF NOT EXISTS `cms_surveymaster` (
              `sur_id` int(11) NOT NULL AUTO_INCREMENT,
              `sur_code` varchar(50) NOT NULL,
              `sur_title` text NOT NULL,
              `sur_url` longtext NOT NULL,
              `sur_onlne_id` text NOT NULL,
              `sur_pri_db_name` text NOT NULL,
              `sur_pri_db_server` text NOT NULL,
              `sur_pri_db_usrnme` text NOT NULL,
              `sur_pri_db_paswrd` blob NOT NULL,
              `sur_sec_db_name` text,
              `sur_sec_db_server` text,
              `sur_sec_db_usrnme` text,
              `sur_sec_db_paswrd` blob,
              `status` varchar(1) DEFAULT '1',
              `create_time` int(11) DEFAULT NULL,
              `create_user` smallint(6) DEFAULT NULL,
              `update_time` int(11) DEFAULT NULL,
              `update_user` smallint(6) DEFAULT NULL,
              `record_date` int(11) DEFAULT NULL,
              PRIMARY KEY (`sur_id`),
              KEY `sur_code` (`sur_code`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8;";
            
            $db->createCommand($createTableSql)->execute();

            // 2. Also ensure other core tables exist from SQL file if empty
            $usersTable = $db->createCommand('SHOW TABLES LIKE "cms_users"')->queryColumn();
            if (empty($usersTable)) {
                $candidates = [
                    Yii::getAlias('@app/DB/ncd.sql'),
                    dirname(__DIR__, 3) . '/DB/ncd.sql',
                    '/var/www/html/DB/ncd.sql'
                ];
                foreach ($candidates as $sqlFile) {
                    if (file_exists($sqlFile)) {
                        $sqlContent = file_get_contents($sqlFile);
                        $queries = explode(";\n", $sqlContent);
                        foreach ($queries as $q) {
                            $q = trim($q);
                            if ($q && strpos($q, '/*') !== 0 && strpos($q, '--') !== 0) {
                                try {
                                    $db->createCommand($q)->execute();
                                } catch (\Throwable $ignored) {}
                            }
                        }
                        break;
                    }
                }
            }
        } catch (\Throwable $e) {
            Yii::error("Surveymaster table create: " . $e->getMessage());
        }
    }

    /**
     * GET /api/v1/surveymaster/index
     * Returns all active surveys
     */
    public function actionIndex()
    {
        $this->ensureTablesExist();
        try {
            $surveys = Surveymaster::find()
                ->where(['status' => '1'])
                ->orderBy(['sur_id' => SORT_ASC])
                ->asArray()
                ->all();
            
            return [
                'status' => 'success',
                'data' => $surveys
            ];
        } catch (\Throwable $e) {
            return [
                'status' => 'success',
                'data' => []
            ];
        }
    }

    /**
     * POST /api/v1/surveymaster/create
     */
    public function actionCreate()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;
        $this->ensureTablesExist();

        try {
            $payload = $this->getPayload();

            $model = new Surveymaster();
            $model->load($payload, '');

            if (empty($model->sur_code)) $model->sur_code = 'S-' . time();
            if (empty($model->sur_title)) $model->sur_title = $payload['sur_title'] ?? $payload['title'] ?? 'NCD Survey Form';
            if (empty($model->sur_pri_db_name)) $model->sur_pri_db_name = 'ncd_local';
            if (empty($model->sur_pri_db_server)) $model->sur_pri_db_server = 'localhost';
            if (empty($model->sur_pri_db_usrnme)) $model->sur_pri_db_usrnme = 'root';
            if (empty($model->sur_pri_db_paswrd)) $model->sur_pri_db_paswrd = 'none';
            if (empty($model->sur_onlne_id)) $model->sur_onlne_id = 'NCD-ONL';
            if (empty($model->status)) $model->status = '1';

            // Store JSON schema in sur_url if provided
            if (isset($payload['schema']) && is_array($payload['schema'])) {
                $model->sur_url = json_encode($payload['schema']);
            } else if (isset($payload['sur_url'])) {
                $model->sur_url = is_array($payload['sur_url']) ? json_encode($payload['sur_url']) : (string)$payload['sur_url'];
            }
            if (empty($model->sur_url)) $model->sur_url = '[]';

            if ($model->save(false)) {
                return ['status' => 'success', 'data' => $model];
            }

            return ['status' => 'error', 'errors' => $model->errors, 'message' => 'Failed to save model'];

        } catch (\Throwable $ex) {
            return [
                'status' => 'error',
                'message' => 'Failed to save survey schema: ' . $ex->getMessage()
            ];
        }
    }

    /**
     * PUT /api/v1/surveymaster/update
     */
    public function actionUpdate($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        try {
            $model = Surveymaster::findOne($id);
            if (!$model) {
                $model = Surveymaster::find()->where(['sur_code' => $id])->one();
            }
            if (!$model) {
                $model = new Surveymaster();
                $model->sur_code = is_numeric($id) ? 'S-' . $id : (string)$id;
            }

            $payload = $this->getPayload();
            $model->load($payload, '');

            if (empty($model->sur_title)) $model->sur_title = $payload['sur_title'] ?? $payload['title'] ?? 'NCD Survey Form';
            if (empty($model->sur_pri_db_name)) $model->sur_pri_db_name = 'ncd_local';
            if (empty($model->sur_pri_db_server)) $model->sur_pri_db_server = 'localhost';
            if (empty($model->sur_pri_db_usrnme)) $model->sur_pri_db_usrnme = 'root';
            if (empty($model->sur_pri_db_paswrd)) $model->sur_pri_db_paswrd = 'none';
            if (empty($model->sur_onlne_id)) $model->sur_onlne_id = 'NCD-ONL';
            if (empty($model->status)) $model->status = '1';

            if (isset($payload['schema']) && is_array($payload['schema'])) {
                $model->sur_url = json_encode($payload['schema']);
            } else if (isset($payload['sur_url'])) {
                $model->sur_url = is_array($payload['sur_url']) ? json_encode($payload['sur_url']) : (string)$payload['sur_url'];
            }

            if ($model->save(false)) {
                return ['status' => 'success', 'data' => $model];
            }

            return ['status' => 'error', 'errors' => $model->errors, 'message' => 'Update failed'];

        } catch (\Throwable $ex) {
            return [
                'status' => 'error',
                'message' => 'Update failed: ' . $ex->getMessage()
            ];
        }
    }
}
