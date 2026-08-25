<?php

namespace app\modules\api\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\Users;

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

        try {
            // For admin panel return all users cleanly
            $users = Users::find()->orderBy(['usr_id' => SORT_ASC])->asArray()->all();
            
            // Expose role & privileges fields
            foreach($users as &$user) {
                unset($user['password']);
                unset($user['auth_key']);
                unset($user['password_reset_token']);
                
                $user['role'] = !empty($user['state_code']) ? $user['state_code'] : 'Staff';
                $user['privileges'] = !empty($user['signedin_loc']) ? $user['signedin_loc'] : 'Full Access';
                $user['location'] = !empty($user['loc_code']) ? $user['loc_code'] : 'Dharavi';
            }
            
            return [
                'status' => 'success',
                'data' => $users
            ];
        } catch (\Throwable $e) {
            return [
                'status' => 'success',
                'data' => []
            ];
        }
    }

    public function actionCreate()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        try {
            $payload = $this->getPayload();

            $model = new Users();
            $model->attributes = $payload;

            $model->record_date = time();
            if (!empty($payload['username'])) {
                $model->users_name = trim($payload['username']);
            }
            if (!empty($payload['users_name'])) {
                $model->users_name = trim($payload['users_name']);
            }
            if (empty($model->full_name)) {
                $model->full_name = !empty($payload['full_name']) ? trim($payload['full_name']) : $model->users_name;
            }
            if (!empty($payload['location'])) {
                $model->loc_code = trim($payload['location']);
            } elseif (!empty($payload['loc_code'])) {
                $model->loc_code = trim($payload['loc_code']);
            } else {
                $model->loc_code = 'Dharavi';
            }

            // Store role string in state_code and privileges in signedin_loc
            if (!empty($payload['role'])) {
                $model->state_code = $payload['role'];
            }
            if (isset($payload['privileges'])) {
                $model->signedin_loc = is_array($payload['privileges']) ? json_encode($payload['privileges']) : $payload['privileges'];
            }
            if (isset($payload['user_role'])) {
                $model->user_role = (int)$payload['user_role'];
            } else {
                $model->user_role = 7;
            }

            $model->status = '1';
            if (empty($model->create_time)) {
                $model->create_time = time();
            }
            if (empty($model->update_time)) {
                $model->update_time = time();
            }

            if (!empty($payload['password'])) {
                $model->password = trim($payload['password']);
            }

            if ($model->save()) {
                $data = $model->toArray();
                unset($data['password']);
                $data['role'] = $model->state_code;
                $data['privileges'] = $model->signedin_loc;
                return [
                    'status' => 'success',
                    'message' => 'User created successfully',
                    'data' => $data
                ];
            }

            Yii::$app->response->statusCode = 400;
            $errors = $model->getErrors();
            $firstError = 'Failed to save user.';
            if (!empty($errors)) {
                $firstKey = array_key_first($errors);
                $firstError = $errors[$firstKey][0] ?? 'Failed to save user.';
            }
            return [
                'status' => 'error',
                'message' => $firstError,
                'errors' => $errors
            ];

        } catch (\Throwable $ex) {
            Yii::$app->response->statusCode = 500;
            return ['status' => 'error', 'message' => $ex->getMessage()];
        }
    }

    public function actionUpdate($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        try {
            $model = Users::findOne($id);
            if (!$model) {
                Yii::$app->response->statusCode = 404;
                return ['status' => 'error', 'message' => 'User not found'];
            }

            $payload = $this->getPayload();
            
            if (empty($payload['password'])) {
                unset($payload['password']);
            }

            $model->attributes = $payload;

            if (empty($model->users_name) && !empty($payload['username'])) {
                $model->users_name = $payload['username'];
            }
            if (empty($model->full_name)) {
                $model->full_name = !empty($payload['full_name']) ? $payload['full_name'] : $model->users_name;
            }
            if (!empty($payload['location'])) {
                $model->loc_code = trim($payload['location']);
            } elseif (!empty($payload['loc_code'])) {
                $model->loc_code = trim($payload['loc_code']);
            }

            if (!empty($payload['role'])) {
                $model->state_code = $payload['role'];
            }
            if (isset($payload['privileges'])) {
                $model->signedin_loc = is_array($payload['privileges']) ? json_encode($payload['privileges']) : $payload['privileges'];
            }
            if (isset($payload['user_role'])) {
                $model->user_role = (int)$payload['user_role'];
            }

            $model->update_time = time();

            if ($model->save()) {
                $data = $model->toArray();
                unset($data['password']);
                $data['role'] = $model->state_code;
                $data['privileges'] = $model->signedin_loc;
                return [
                    'status' => 'success',
                    'message' => 'User updated successfully',
                    'data' => $data
                ];
            }

            Yii::$app->response->statusCode = 400;
            $errors = $model->getErrors();
            $firstError = 'Failed to save user.';
            if (!empty($errors)) {
                $firstKey = array_key_first($errors);
                $firstError = $errors[$firstKey][0] ?? 'Failed to save user.';
            }
            return [
                'status' => 'error',
                'message' => $firstError,
                'errors' => $errors
            ];

        } catch (\Throwable $ex) {
            Yii::$app->response->statusCode = 500;
            return ['status' => 'error', 'message' => $ex->getMessage()];
        }
    }

    public function actionDelete($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        try {
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

        } catch (\Throwable $ex) {
            Yii::$app->response->statusCode = 500;
            return ['status' => 'error', 'message' => $ex->getMessage()];
        }
    }
}
