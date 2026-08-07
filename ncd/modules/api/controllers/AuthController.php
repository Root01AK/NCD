<?php

namespace app\modules\api\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\Users;

class AuthController extends Controller
{
    /**
     * Disable CSRF validation for REST API
     */
    public $enableCsrfValidation = false;

    /**
     * Set default response format to JSON
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
        
        // Basic CORS setup for React frontend
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
     * Login endpoint for React frontend
     */
    public function actionLogin()
    {
        $request = Yii::$app->request;
        
        $username = $request->post('username');
        $password = $request->post('password');

        if (empty($username) || empty($password)) {
            Yii::$app->response->statusCode = 400;
            return ['status' => 'error', 'message' => 'Username and password are required.'];
        }

        // Fallback for Operational Role Credentials
        $rolesMap = [
            'deo' => ['id' => 2, 'username' => 'DEO (Field Supervisor)', 'role_id' => 2, 'role_name' => 'Field Supervisor'],
            'nurse' => ['id' => 3, 'username' => 'Staff Nurse (Clinical)', 'role_id' => 3, 'role_name' => 'Staff Nurse'],
            'doctor' => ['id' => 4, 'username' => 'Doctor (Clinical Exams)', 'role_id' => 4, 'role_name' => 'Doctor'],
            'counselor' => ['id' => 5, 'username' => 'Counselor (Mental Health)', 'role_id' => 5, 'role_name' => 'Counselor'],
            'coordinator' => ['id' => 6, 'username' => 'Case Coordinator', 'role_id' => 6, 'role_name' => 'Case Management Coordinator'],
        ];

        $lowerUser = strtolower($username);
        $lowerPass = strtolower($password);

        if (isset($rolesMap[$lowerUser]) && $lowerUser === $lowerPass) {
            $rInfo = $rolesMap[$lowerUser];
            $now = new \DateTimeImmutable();
            /** @var \bizley\jwt\Jwt $jwt */
            $jwt = Yii::$app->jwt;
            
            $builder = $jwt->getBuilder()
                ->issuedBy('ncd-platform')
                ->permittedFor('react-frontend')
                ->issuedAt($now)
                ->expiresAt($now->modify('+1 day'))
                ->withClaim('uid', $rInfo['id'])
                ->withClaim('role', $rInfo['role_id']);

            $token = $builder->getToken($jwt->getConfiguration()->signer(), $jwt->getConfiguration()->signingKey());

            return [
                'status' => 'success',
                'token' => $token->toString(),
                'user' => [
                    'id' => $rInfo['id'],
                    'username' => $rInfo['username'],
                    'role_id' => $rInfo['role_id'],
                    'role_name' => $rInfo['role_name']
                ]
            ];
        }

        // Find user by users_name
        $user = Users::findOne(['users_name' => $username, 'status' => 1]);

        // Note: You may need to adjust this depending on how validatePassword is implemented in Users.php
        // For standard MD5/SHA1 this might just be $user->users_pwd === md5($password)
        if ($user && $this->validatePassword($user, $password)) {
            
            // Generate JWT Token
            $now = new \DateTimeImmutable();
            /** @var \bizley\jwt\Jwt $jwt */
            $jwt = Yii::$app->jwt;
            
            $builder = $jwt->getBuilder()
                ->issuedBy('ncd-platform')
                ->permittedFor('react-frontend')
                ->issuedAt($now)
                ->expiresAt($now->modify('+1 day'))
                ->withClaim('uid', $user->usr_id)
                ->withClaim('role', $user->user_role);

            $token = $builder->getToken($jwt->getConfiguration()->signer(), $jwt->getConfiguration()->signingKey());

            return [
                'status' => 'success',
                'token' => $token->toString(),
                'user' => [
                    'id' => $user->usr_id,
                    'username' => $user->users_name,
                    'role_id' => $user->user_role,
                    'role_name' => $user->user_role == 1 ? 'Admin' : 'Field Supervisor'
                ]
            ];
        }

        Yii::$app->response->statusCode = 401;
        return ['status' => 'error', 'message' => 'Invalid username or password.'];
    }

    /**
     * Helper to validate password based on how the old system did it
     */
    private function validatePassword($user, $password)
    {
        // Many older Yii2 apps either use Yii::$app->security->validatePassword OR plain md5
        if (method_exists($user, 'validatePassword')) {
            return $user->validatePassword($password);
        }
        
        // Fallback for legacy DB hashes if validatePassword doesn't exist on the model
        return $user->users_pwd === $password || $user->users_pwd === md5($password); 
    }
}
