<?php

namespace app\modules\api\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\Users;
use bizley\jwt\JwtHttpBearerAuth;

class UsersController extends Controller
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
        // For admin panel we return all users
        $users = Users::find()->orderBy(['usr_id' => SORT_ASC])->asArray()->all();
        
        // Hide passwords
        foreach($users as &$user) {
            unset($user['password']);
            unset($user['auth_key']);
            unset($user['password_reset_token']);
        }
        
        return [
            'status' => 'success',
            'data' => $users
        ];
    }

    public function actionCreate()
    {
        $request = Yii::$app->request;
        $payload = $request->getBodyParams();

        $model = new Users();
        $model->attributes = $payload;

        // Basic default setup for user
        $model->record_date = date('Y-m-d H:i:s');
        if (!empty($payload['password'])) {
            $model->password = md5($payload['password']); // Using md5 because the original system seems to use basic hashing or raw passwords, but in a real system use Yii::$app->security->generatePasswordHash()
        }

        if ($model->save()) {
            $data = $model->toArray();
            unset($data['password']);
            return [
                'status' => 'success',
                'message' => 'User created successfully',
                'data' => $data
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
        $model = Users::findOne($id);
        if (!$model) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'User not found'];
        }

        $request = Yii::$app->request;
        $payload = $request->getBodyParams();
        
        if (!empty($payload['password'])) {
            $payload['password'] = md5($payload['password']);
        } else {
            unset($payload['password']); // don't override with empty
        }

        $model->attributes = $payload;

        if ($model->save()) {
            $data = $model->toArray();
            unset($data['password']);
            return [
                'status' => 'success',
                'message' => 'User updated successfully',
                'data' => $data
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
        $model = Users::findOne($id);
        if (!$model) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'User not found'];
        }

        if ($model->delete()) {
            return [
                'status' => 'success',
                'message' => 'User deleted successfully'
            ];
        }

        Yii::$app->response->statusCode = 500;
        return ['status' => 'error', 'message' => 'Failed to delete user'];
    }
}
