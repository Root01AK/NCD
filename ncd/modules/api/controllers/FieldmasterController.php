<?php

namespace app\modules\api\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\Fieldmaster;

class FieldmasterController extends Controller
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
                'Access-Control-Request-Method' => ['GET', 'POST', 'PUT', 'OPTIONS'],
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

    public function actionIndex()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        try {
            $fields = Fieldmaster::find()->orderBy(['fld_mstr_frmfield' => SORT_ASC, 'fld_mstr_id' => SORT_ASC])->asArray()->all();
            
            return [
                'status' => 'success',
                'data' => $fields
            ];
        } catch (\Throwable $e) {
            return [
                'status' => 'success',
                'data' => []
            ];
        }
    }

    public function actionUpdate($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        try {
            $model = Fieldmaster::findOne($id);
            if (!$model) {
                Yii::$app->response->statusCode = 404;
                return ['status' => 'error', 'message' => 'Field not found'];
            }

            $request = Yii::$app->request;
            $desc = $request->post('fld_mstr_desc');
            $status = $request->post('status');

            if ($desc !== null) $model->fld_mstr_desc = $desc;
            if ($status !== null) $model->status = $status;

            if ($model->save()) {
                return [
                    'status' => 'success',
                    'message' => 'Field updated successfully',
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
            return ['status' => 'error', 'message' => $ex->getMessage()];
        }
    }

    public function actionForm($name)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        try {
            $fields = Fieldmaster::find()
                ->where(['fld_mstr_frmfield' => $name, 'status' => '1'])
                ->orderBy(['fld_mstr_id' => SORT_ASC])
                ->asArray()
                ->all();

            return [
                'status' => 'success',
                'data' => $fields
            ];
        } catch (\Throwable $e) {
            return [
                'status' => 'success',
                'data' => []
            ];
        }
    }
}
