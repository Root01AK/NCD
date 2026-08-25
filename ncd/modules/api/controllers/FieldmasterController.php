<?php

namespace app\modules\api\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\Fieldmaster;
use bizley\jwt\JwtHttpBearerAuth;

class FieldmasterController extends Controller
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
                'Origin' => ['*'],
                'Access-Control-Request-Method' => ['GET', 'POST', 'PUT', 'OPTIONS'],
                'Access-Control-Request-Headers' => ['*'],
                'Access-Control-Allow-Credentials' => true,
                'Access-Control-Max-Age' => 3600,
                'Access-Control-Expose-Headers' => ['*'],
            ],
        ];

        // JWT Authentication
        $behaviors['authenticator'] = [
            'class' => JwtHttpBearerAuth::class,
            'optional' => ['options'], // OPTIONS method should not require auth
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
     * GET /api/v1/fieldmaster/index
     * Returns all fields for the Admin Data Dictionary Builder
     */
    public function actionIndex()
    {
        $fields = Fieldmaster::find()->orderBy(['fld_mstr_frmfield' => SORT_ASC, 'fld_mstr_id' => SORT_ASC])->asArray()->all();
        
        return [
            'status' => 'success',
            'data' => $fields
        ];
    }

    /**
     * POST /api/v1/fieldmaster/update?id=123
     * Updates a field definition (Label, Status) from the Admin Builder
     */
    public function actionUpdate($id)
    {
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
    }

    /**
     * GET /api/v1/fieldmaster/form?name=Screening
     * Returns ACTIVE fields for a specific form (For Client UI dynamic rendering)
     */
    public function actionForm($name)
    {
        // Example form names: "1" for OST Visit, etc. Need to query based on fld_mstr_frmfield
        $fields = Fieldmaster::find()
            ->where(['fld_mstr_frmfield' => $name, 'status' => '1'])
            ->orderBy(['fld_mstr_id' => SORT_ASC])
            ->asArray()
            ->all();

        return [
            'status' => 'success',
            'data' => $fields
        ];
    }
}
