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

    /**
     * GET /api/v1/surveymaster/index
     * Returns all active surveys
     */
    public function actionIndex()
    {
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

            if ($model->save()) {
                return ['status' => 'success', 'data' => $model];
            }

            Yii::$app->response->statusCode = 400;
            return ['status' => 'error', 'errors' => $model->errors];

        } catch (\Throwable $ex) {
            Yii::$app->response->statusCode = 500;
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
                Yii::$app->response->statusCode = 404;
                return ['status' => 'error', 'message' => 'Survey not found.'];
            }

            $payload = $this->getPayload();
            $model->load($payload, '');

            if (isset($payload['schema']) && is_array($payload['schema'])) {
                $model->sur_url = json_encode($payload['schema']);
            } else if (isset($payload['sur_url']) && is_array($payload['sur_url'])) {
                $model->sur_url = json_encode($payload['sur_url']);
            }

            if (empty($model->sur_pri_db_paswrd)) $model->sur_pri_db_paswrd = 'none';

            if ($model->save()) {
                return ['status' => 'success', 'data' => $model];
            }

            Yii::$app->response->statusCode = 400;
            return ['status' => 'error', 'errors' => $model->errors];

        } catch (\Throwable $ex) {
            Yii::$app->response->statusCode = 500;
            return [
                'status' => 'error',
                'message' => 'Update failed: ' . $ex->getMessage()
            ];
        }
    }
}
