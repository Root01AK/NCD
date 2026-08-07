<?php

namespace app\modules\api\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\Locationmaster;
use bizley\jwt\JwtHttpBearerAuth;

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
                'Origin' => ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178', 'http://localhost:5179', 'http://localhost:5180', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175', 'http://127.0.0.1:5176', 'http://127.0.0.1:5177', 'http://127.0.0.1:5178', 'http://127.0.0.1:5179', 'http://127.0.0.1:5180'],
                'Access-Control-Request-Method' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                'Access-Control-Request-Headers' => ['*'],
                'Access-Control-Allow-Credentials' => true,
                'Access-Control-Max-Age' => 3600,
                'Access-Control-Expose-Headers' => ['*'],
            ],
        ];

        $behaviors['authenticator'] = [
            'class' => JwtHttpBearerAuth::class,
            'optional' => ['options'],
        ];

        return $behaviors;
    }

    public function actionOptions()
    {
        Yii::$app->getResponse()->setStatusCode(200);
    }

    public function actionIndex()
    {
        $locations = Locationmaster::find()->orderBy(['loc_id' => SORT_ASC])->asArray()->all();
        
        return [
            'status' => 'success',
            'data' => $locations
        ];
    }

    public function actionCreate()
    {
        $request = Yii::$app->request;
        $payload = $request->getBodyParams();

        $model = new Locationmaster();
        $model->attributes = $payload;

        // Ensure required Locationmaster fields are populated
        if (empty($model->loc_name)) {
            $model->loc_name = !empty($payload['loc_city']) ? $payload['loc_city'] : 'Location';
        }
        if (empty($model->state_code)) {
            $model->state_code = !empty($payload['loc_state']) ? strtoupper(substr($payload['loc_state'], 0, 2)) : 'MH';
        }
        if (empty($model->loc_code)) {
            $code = strtoupper(preg_replace('/[^A-Z]/', '', $model->loc_name));
            if (strlen($code) < 2) $code = 'LOC';
            $model->loc_code = substr($code, 0, 2);
        }
        if (empty($model->status)) {
            $model->status = !empty($payload['loc_status']) ? (string)$payload['loc_status'] : '1';
        }

        if ($model->save()) {
            return [
                'status' => 'success',
                'message' => 'Location created successfully',
                'data' => $model
            ];
        }

        Yii::$app->response->statusCode = 400;
        return [
            'status' => 'error',
            'errors' => $model->getErrors()
        ];
    }

    public function actionUpdate($id)
    {
        $model = Locationmaster::findOne($id);
        if (!$model) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'Location not found'];
        }

        $request = Yii::$app->request;
        $payload = $request->getBodyParams();
        
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
    }

    public function actionDelete($id)
    {
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
    }
}
