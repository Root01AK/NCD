<?php

namespace app\modules\api\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use bizley\jwt\JwtHttpBearerAuth;

class ScreeningController extends Controller
{
    /**
     * Disable CSRF validation for REST API
     */
    public $enableCsrfValidation = false;

    /**
     * Setup Behaviors (CORS and JWT Auth)
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

        // CORS Setup
        $behaviors['corsFilter'] = [
            'class' => \yii\filters\Cors::class,
            'cors' => [
                'Origin' => ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178', 'http://localhost:5179', 'http://localhost:5180', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175', 'http://127.0.0.1:5176', 'http://127.0.0.1:5177', 'http://127.0.0.1:5178', 'http://127.0.0.1:5179', 'http://127.0.0.1:5180'],
                'Access-Control-Request-Method' => ['POST', 'OPTIONS'],
                'Access-Control-Request-Headers' => ['*'],
                'Access-Control-Allow-Credentials' => true,
                'Access-Control-Max-Age' => 3600,
                'Access-Control-Expose-Headers' => ['*'],
            ],
        ];

        // JWT Authentication
        $behaviors['authenticator'] = [
            'class' => JwtHttpBearerAuth::class,
            'optional' => ['options'],
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
     * POST /api/v1/screening/submit
     * Receives dynamic survey data from the DEO React Panel and stores it.
     */
    public function actionSubmit()
    {
        $request = Yii::$app->request;
        $payload = $request->getBodyParams();

        if (empty($payload)) {
            Yii::$app->response->statusCode = 400;
            return ['status' => 'error', 'message' => 'No data received'];
        }

        // Get the logged in user from JWT
        $user = Yii::$app->user->identity;

        try {
            // Using Yii2 Query Builder to dynamically insert the data 
            // into cms_screening since the fields are metadata-driven.
            
            // In a real scenario, we should filter $payload keys to match cms_screening columns
            $db = Yii::$app->db;
            $tableName = 'cms_screening';
            
            $partId = $payload['mem_scrn_part_id'] ?? ('NCD-MUM-' . rand(1000, 9999));
            $payload['mem_scrn_part_id'] = $partId;
            $payload['record_date'] = time();

            // Check if participant record already exists in database
            $existing = (new \yii\db\Query())
                ->from($tableName)
                ->where(['mem_scrn_part_id' => $partId])
                ->one();

            if ($existing) {
                // Merge existing JSON payload with incoming section payload
                $oldJson = !empty($existing['mem_scrn_q30']) ? json_decode($existing['mem_scrn_q30'], true) : [];
                if (!is_array($oldJson)) $oldJson = [];
                
                $merged = array_merge($oldJson, $payload);
                $merged['mem_scrn_q30'] = json_encode($merged);
                
                // Keep core columns populated
                $updateCols = [
                    'mem_scrn_q16' => $merged['fullName'] ?? $merged['mem_scrn_q16'] ?? $existing['mem_scrn_q16'],
                    'mem_scrn_q1' => (int)($merged['age'] ?? $merged['mem_scrn_q1'] ?? $existing['mem_scrn_q1']),
                    'mem_scrn_q2' => ($merged['gender'] === 'Male' || $merged['mem_scrn_q2'] == '1') ? '1' : '2',
                    'mem_scrn_q17' => $merged['location'] ?? $merged['mem_scrn_q17'] ?? $existing['mem_scrn_q17'],
                    'mem_scrn_q30' => $merged['mem_scrn_q30'],
                    'update_time' => time()
                ];

                $db->createCommand()->update($tableName, $updateCols, ['mem_scrn_part_id' => $partId])->execute();
            } else {
                // Insert new participant initial screening (Field Supervisor Section 1)
                $payload['mem_scrn_q30'] = json_encode($payload);
                $insertCols = [
                    'mem_scrn_part_id' => $partId,
                    'mem_scrn_q16' => $payload['fullName'] ?? $payload['mem_scrn_q16'] ?? 'Participant',
                    'mem_scrn_q1' => (int)($payload['age'] ?? $payload['mem_scrn_q1'] ?? 45),
                    'mem_scrn_q2' => ($payload['gender'] === 'Male' || $payload['mem_scrn_q2'] == '1') ? '1' : '2',
                    'mem_scrn_q17' => $payload['location'] ?? $payload['mem_scrn_q17'] ?? 'Dharavi',
                    'mem_scrn_q30' => $payload['mem_scrn_q30'],
                    'record_date' => time(),
                    'status' => '1'
                ];

                $db->createCommand()->insert($tableName, $insertCols)->execute();
            }

            return [
                'status' => 'success',
                'message' => 'Screening section saved successfully',
                'participant_id' => $partId
            ];

        } catch (\Exception $e) {
            Yii::$app->response->statusCode = 500;
            return [
                'status' => 'error',
                'message' => 'Failed to save screening data: ' . $e->getMessage()
            ];
        }
    }
}
