<?php

namespace app\modules\api\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\Surveymaster;
use bizley\jwt\JwtHttpBearerAuth;

class SurveymasterController extends Controller
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

        unset($behaviors['authenticator']);

        // CORS Setup
        $behaviors['corsFilter'] = [
            'class' => \yii\filters\Cors::class,
            'cors' => [
                'Origin' => ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178', 'http://localhost:5179', 'http://localhost:5180'],
                'Access-Control-Request-Method' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
     * GET /api/v1/surveymaster/index
     * Returns all active surveys
     */
    public function actionIndex()
    {
        $surveys = Surveymaster::find()->where(['status' => '1'])->orderBy(['sur_id' => SORT_ASC])->asArray()->all();
        
        return [
            'status' => 'success',
            'data' => $surveys
        ];
    }

    /**
     * POST /api/v1/surveymaster/create
     */
    public function actionCreate()
    {
        $model = new Surveymaster();
        $model->load(Yii::$app->request->post(), '');
        
        // Mock required DB fields if they are missing
        if (empty($model->sur_pri_db_name)) $model->sur_pri_db_name = 'ncd_local';
        if (empty($model->sur_pri_db_server)) $model->sur_pri_db_server = 'localhost';
        if (empty($model->sur_pri_db_usrnme)) $model->sur_pri_db_usrnme = 'root';
        if (empty($model->sur_pri_db_paswrd)) $model->sur_pri_db_paswrd = '';
        if (empty($model->sur_onlne_id)) $model->sur_onlne_id = 'NCD-ONL';
        if (empty($model->status)) $model->status = '1';
        
        if ($model->save()) {
            return ['status' => 'success', 'data' => $model];
        }
        return ['status' => 'error', 'errors' => $model->errors];
    }

    /**
     * PUT /api/v1/surveymaster/update
     */
    public function actionUpdate($id)
    {
        $model = Surveymaster::findOne($id);
        if (!$model) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'Survey not found.'];
        }
        
        $model->load(Yii::$app->request->post(), '');
        if ($model->save()) {
            return ['status' => 'success', 'data' => $model];
        }
        return ['status' => 'error', 'errors' => $model->errors];
    }
}
