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
            
            // Automatically append metadata
            $payload['record_date'] = strtotime(date('Y-m-d H:i:s'));
            
            // Assume the participant ID is passed in the payload
            if (empty($payload['mem_scrn_part_id'])) {
                 // Generate a new participant ID if new
                 $payload['mem_scrn_part_id'] = 'S-' . rand(1000, 9999);
            }

            // Insert into Database
            $db->createCommand()->insert($tableName, $payload)->execute();

            return [
                'status' => 'success',
                'message' => 'Screening submitted successfully',
                'record_id' => $payload['mem_scrn_part_id']
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
