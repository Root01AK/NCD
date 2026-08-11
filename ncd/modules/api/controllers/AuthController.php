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

        // Operational & Quick Role Credentials Map
        $rolesMap = [
            'admin_user'  => ['pass' => 'admin123', 'id' => 1, 'username' => 'Admin User', 'role_id' => 1, 'role_name' => 'Admin'],
            'admin'       => ['pass' => 'admin123', 'id' => 1, 'username' => 'Admin User', 'role_id' => 1, 'role_name' => 'Admin'],
            'deo'         => ['pass' => 'deo', 'id' => 2, 'username' => 'DEO (Field Supervisor)', 'role_id' => 2, 'role_name' => 'Field Supervisor'],
            'nurse'       => ['pass' => 'nurse', 'id' => 3, 'username' => 'Staff Nurse (Clinical)', 'role_id' => 3, 'role_name' => 'Staff Nurse'],
            'doctor'      => ['pass' => 'doctor', 'id' => 4, 'username' => 'Doctor (Clinical Exams)', 'role_id' => 4, 'role_name' => 'Doctor'],
            'counselor'   => ['pass' => 'counselor', 'id' => 5, 'username' => 'Counselor (Mental Health)', 'role_id' => 5, 'role_name' => 'Counselor'],
            'coordinator' => ['pass' => 'coordinator', 'id' => 6, 'username' => 'Case Coordinator', 'role_id' => 6, 'role_name' => 'Case Management Coordinator'],
        ];

        $lowerUser = strtolower(trim($username));
        $lowerPass = strtolower(trim($password));

        if (isset($rolesMap[$lowerUser]) && $rolesMap[$lowerUser]['pass'] === $lowerPass) {
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

        // Find user by users_name in DB (case-insensitive)
        $cleanUsername = trim($username);
        $user = Users::find()
            ->where(['users_name' => $cleanUsername])
            ->orWhere(['LIKE', 'users_name', $cleanUsername, false])
            ->one();

        if ($user && $this->validatePassword($user, $password)) {
            
            $roleNames = [
                1 => 'Admin',
                2 => 'Field Supervisor',
                3 => 'Staff Nurse',
                4 => 'Doctor',
                5 => 'Counselor',
                6 => 'Case Management Coordinator',
                7 => 'Data Entry Operator'
            ];
            
            $stateRole = !empty($user->state_code) ? $user->state_code : null;
            $rName = 'Field Supervisor';
            if ($stateRole === 'staff_nurse') $rName = 'Staff Nurse';
            else if ($stateRole === 'doctor') $rName = 'Doctor';
            else if ($stateRole === 'counselor') $rName = 'Counselor';
            else if ($stateRole === 'case_management_coordinator') $rName = 'Case Coordinator';
            else if ($stateRole === 'deo') $rName = 'Data Entry Operator';
            else if ($stateRole === 'admin') $rName = 'Admin';
            else if (isset($roleNames[(int)$user->user_role])) {
                $rName = $roleNames[(int)$user->user_role];
            }

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
                    'full_name' => $user->full_name ?: $user->users_name,
                    'role_id' => (int)$user->user_role,
                    'role_name' => $rName,
                    'role' => $stateRole ?: 'field_supervisor',
                    'privileges' => !empty($user->signedin_loc) ? $user->signedin_loc : null,
                    'assigned_location' => $user->loc_code ?: 'Dharavi'
                ]
            ];
        }

        Yii::$app->response->statusCode = 401;
        return ['status' => 'error', 'message' => 'Invalid username or password.'];
    }

    /**
     * Helper to validate password based on plain text, single/double MD5 or legacy DB hashes
     */
    private function validatePassword($user, $password)
    {
        $stored = $user->password ?? $user->users_pwd ?? '';
        if (empty($stored)) return false;

        $trimPass = trim($password);
        $md5 = md5($trimPass);
        $doubleMd5 = md5($md5);

        if ($stored === $trimPass || $stored === $md5 || $stored === $doubleMd5) {
            return true;
        }

        // Check legacy or Yii2 hashed password
        try {
            if (Yii::$app->security->validatePassword($trimPass, $stored)) {
                return true;
            }
        } catch (\Exception $e) {}

        return false;
    }
}
