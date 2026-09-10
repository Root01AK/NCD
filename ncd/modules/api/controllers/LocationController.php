<?php

namespace app\modules\api\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\Locationmaster;

class LocationController extends Controller
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

    public function actionOptions()
    {
        Yii::$app->getResponse()->setStatusCode(200);
    }

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

    public function actionIndex()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;
        if (function_exists('ncd_ensure_schema_ready')) {
            ncd_ensure_schema_ready();
        }

        $defaultLocations = [
            ['loc_id' => 1, 'loc_code' => 'DH', 'loc_name' => 'Dharavi', 'loc_city' => 'Dharavi', 'loc_district' => 'Mumbai', 'loc_state' => 'MH', 'state_code' => 'MH', 'status' => '1', 'loc_status' => '1'],
            ['loc_id' => 2, 'loc_code' => 'ML', 'loc_name' => 'Malvani', 'loc_city' => 'Malvani', 'loc_district' => 'Mumbai', 'loc_state' => 'MH', 'state_code' => 'MH', 'status' => '1', 'loc_status' => '1'],
            ['loc_id' => 3, 'loc_code' => 'VA', 'loc_name' => 'Vashi', 'loc_city' => 'Vashi', 'loc_district' => 'Navi Mumbai', 'loc_state' => 'MH', 'state_code' => 'MH', 'status' => '1', 'loc_status' => '1'],
            ['loc_id' => 4, 'loc_code' => 'KU', 'loc_name' => 'Kurla', 'loc_city' => 'Kurla', 'loc_district' => 'Mumbai', 'loc_state' => 'MH', 'state_code' => 'MH', 'status' => '1', 'loc_status' => '1'],
            ['loc_id' => 5, 'loc_code' => 'GH', 'loc_name' => 'Ghatkopar', 'loc_city' => 'Ghatkopar', 'loc_district' => 'Mumbai', 'loc_state' => 'MH', 'state_code' => 'MH', 'status' => '1', 'loc_status' => '1']
        ];

        try {
            $locations = Locationmaster::find()->orderBy(['loc_id' => SORT_ASC])->asArray()->all();
            
            if (empty($locations)) {
                // Auto-seed standard location records into database
                try {
                    $db = Yii::$app->db;
                    foreach ($defaultLocations as $dl) {
                        $db->createCommand()->insert('cms_locationmaster', [
                            'loc_code' => $dl['loc_code'],
                            'loc_name' => $dl['loc_name'],
                            'state_code' => $dl['state_code'],
                            'status' => '1',
                            'del_status' => 0,
                            'create_time' => time(),
                            'record_date' => time()
                        ])->execute();
                    }
                    $locations = Locationmaster::find()->orderBy(['loc_id' => SORT_ASC])->asArray()->all();
                } catch (\Throwable $e2) {}
            }

            return [
                'status' => 'success',
                'data' => !empty($locations) ? $locations : $defaultLocations
            ];
        } catch (\Throwable $e) {
            return [
                'status' => 'success',
                'data' => $defaultLocations
            ];
        }
    }

    public function actionCreate()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        try {
            $payload = $this->getPayload();

            $model = new Locationmaster();
            $model->attributes = $payload;

            // Ensure loc_name is populated
            if (empty($model->loc_name)) {
                $model->loc_name = !empty($payload['loc_city']) ? $payload['loc_city'] : (!empty($payload['location']) ? $payload['location'] : 'New Location');
            }

            // Ensure state_code is 2 characters
            if (empty($model->state_code)) {
                $stateInput = !empty($payload['loc_state']) ? $payload['loc_state'] : 'MH';
                $cleanState = strtoupper(preg_replace('/[^A-Z]/', '', $stateInput));
                $model->state_code = (strlen($cleanState) >= 2) ? substr($cleanState, 0, 2) : 'MH';
            }

            // Fetch all existing location codes to guarantee uniqueness
            $existingCodes = Locationmaster::find()->select('loc_code')->column();
            $existingMap = array_flip(array_map('strtoupper', array_filter($existingCodes)));

            $requestedCode = strtoupper(preg_replace('/[^A-Z]/', '', (string)$model->loc_code));
            if (strlen($requestedCode) !== 2 || isset($existingMap[$requestedCode])) {
                $base = strtoupper(preg_replace('/[^A-Z]/', '', (string)$model->loc_name));
                if (strlen($base) < 2) $base = 'LC';

                $candidate = substr($base, 0, 2);
                if (isset($existingMap[$candidate])) {
                    $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                    for ($i = 0; $i < 26; $i++) {
                        for ($j = 0; $j < 26; $j++) {
                            $cand = $alphabet[$i] . $alphabet[$j];
                            if (!isset($existingMap[$cand])) {
                                $candidate = $cand;
                                break 2;
                            }
                        }
                    }
                }
                $model->loc_code = $candidate;
            } else {
                $model->loc_code = $requestedCode;
            }

            if (empty($model->status)) {
                $model->status = '1';
            }

            if ($model->save()) {
                return [
                    'status' => 'success',
                    'message' => 'Location created successfully',
                    'data' => $model
                ];
            }

            $errMsgs = [];
            foreach ($model->getErrors() as $attrErrs) {
                $errMsgs = array_merge($errMsgs, $attrErrs);
            }
            Yii::$app->response->statusCode = 400;
            return [
                'status' => 'error',
                'message' => 'Validation error: ' . implode(', ', $errMsgs),
                'errors' => $model->getErrors()
            ];

        } catch (\Throwable $ex) {
            Yii::$app->response->statusCode = 500;
            return [
                'status' => 'error',
                'message' => 'Failed to create location: ' . $ex->getMessage()
            ];
        }
    }

    public function actionUpdate($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        try {
            $model = Locationmaster::findOne($id);
            if (!$model) {
                Yii::$app->response->statusCode = 404;
                return ['status' => 'error', 'message' => 'Location not found'];
            }

            $payload = $this->getPayload();
            $model->attributes = $payload;

            if (empty($model->loc_name) && !empty($payload['loc_city'])) {
                $model->loc_name = $payload['loc_city'];
            }

            if ($model->save()) {
                return [
                    'status' => 'success',
                    'message' => 'Location updated successfully',
                    'data' => $model
                ];
            }

            Yii::$app->response->statusCode = 400;
            return [
                'status' => 'error',
                'errors' => $model->getErrors()
            ];

        } catch (\Throwable $ex) {
            Yii::$app->response->statusCode = 500;
            return [
                'status' => 'error',
                'message' => 'Failed to update location: ' . $ex->getMessage()
            ];
        }
    }

    public function actionDelete($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        try {
            $model = Locationmaster::findOne($id);
            if (!$model) {
                Yii::$app->response->statusCode = 404;
                return ['status' => 'error', 'message' => 'Location not found'];
            }

            if ($model->delete()) {
                return [
                    'status' => 'success',
                    'message' => 'Location deleted successfully'
                ];
            }

            Yii::$app->response->statusCode = 500;
            return ['status' => 'error', 'message' => 'Failed to delete location'];

        } catch (\Throwable $ex) {
            Yii::$app->response->statusCode = 500;
            return ['status' => 'error', 'message' => $ex->getMessage()];
        }
    }
}
