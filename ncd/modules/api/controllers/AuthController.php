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
        
        // Allow CORS origins
        $behaviors['corsFilter'] = [
            'class' => \yii\filters\Cors::class,
            'cors' => [
                'Origin' => ['*'],
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
        Yii::$app->response->format = Response::FORMAT_JSON;

        try {
            $this->ensureDatabaseSeeded();

            $request = Yii::$app->request;
            
            // Extract body parameters safely for JSON requests
            $bodyParams = [];
            try {
                $bodyParams = $request->getBodyParams();
            } catch (\Throwable $e) {}

            if (empty($bodyParams)) {
                $raw = $request->getRawBody();
                if (!empty($raw)) {
                    $bodyParams = json_decode($raw, true) ?: [];
                }
            }

            $username = $bodyParams['username'] ?? $request->post('username') ?? '';
            $password = $bodyParams['password'] ?? $request->post('password') ?? '';

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

            $lowerUser = strtolower(trim((string)$username));
            $lowerPass = strtolower(trim((string)$password));

            if (isset($rolesMap[$lowerUser]) && $rolesMap[$lowerUser]['pass'] === $lowerPass) {
                $rInfo = $rolesMap[$lowerUser];
                
                try {
                    $randData = random_bytes(16);
                } catch (\Throwable $rErr) {
                    $randData = md5(uniqid(microtime(), true));
                }
                $tokenStr = "token_quick_" . bin2hex($randData);
                try {
                    if (Yii::$app->has('jwt')) {
                        /** @var \bizley\jwt\Jwt $jwt */
                        $jwt = Yii::$app->jwt;
                        if ($jwt && method_exists($jwt, 'getBuilder')) {
                            $now = new \DateTimeImmutable();
                            $builder = $jwt->getBuilder()
                                ->issuedBy('ncd-platform')
                                ->permittedFor('react-frontend')
                                ->issuedAt($now)
                                ->expiresAt($now->modify('+1 day'))
                                ->withClaim('uid', $rInfo['id'])
                                ->withClaim('role', $rInfo['role_id']);

                            $tokenObj = $builder->getToken($jwt->getConfiguration()->signer(), $jwt->getConfiguration()->signingKey());
                            $tokenStr = $tokenObj->toString();
                        }
                    }
                } catch (\Throwable $e) {
                    // Fallback to quick random token if JWT throws
                }

                Yii::$app->response->statusCode = 200;
                return [
                    'status' => 'success',
                    'token' => $tokenStr,
                    'user' => [
                        'id' => $rInfo['id'],
                        'username' => $rInfo['username'],
                        'role_id' => $rInfo['role_id'],
                        'role_name' => $rInfo['role_name']
                    ]
                ];
            }

            // DB Lookup Fallback
            try {
                $cleanUsername = trim((string)$username);
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

                    $userRole = (int)($user->role_id ?? $user->user_role ?? 1);
                    $roleLabel = $roleNames[$userRole] ?? 'Staff';

                    $tokenStr = "token_db_" . bin2hex(random_bytes(16));

                    Yii::$app->response->statusCode = 200;
                    return [
                        'status' => 'success',
                        'token' => $tokenStr,
                        'user' => [
                            'id' => $user->id ?? $user->usr_id ?? 1,
                            'username' => $user->users_name,
                            'role_id' => $userRole,
                            'role_name' => $roleLabel
                        ]
                    ];
                }
            } catch (\Throwable $dbErr) {
                // Ignore DB query errors and return invalid credentials response
            }

            Yii::$app->response->statusCode = 401;
            return [
                'status' => 'error',
                'message' => 'Invalid username or password. Please check your staff credentials.'
            ];

        } catch (\Throwable $ex) {
            Yii::$app->response->statusCode = 200;
            return [
                'status' => 'error',
                'message' => 'Server Error: ' . $ex->getMessage()
            ];
        }
    }

    /**
     * Helper to validate password based on plain text, single/double MD5 or legacy DB hashes
     */
    private function validatePassword($user, $password)
    {
        try {
            $stored = $user->password ?? $user->users_pwd ?? '';
            if (empty($stored)) return false;

            $trimPass = trim((string)$password);
            $md5 = md5($trimPass);
            $doubleMd5 = md5($md5);

            if ($stored === $trimPass || $stored === $md5 || $stored === $doubleMd5) {
                return true;
            }

            if (Yii::$app->has('security') && Yii::$app->security) {
                if (Yii::$app->security->validatePassword($trimPass, $stored)) {
                    return true;
                }
            }
        } catch (\Throwable $e) {}

        return false;
    }

    private function ensureDatabaseSeeded()
    {
        try {
            $db = Yii::$app->db;
            
            try {
                $db->createCommand("
                    CREATE TABLE IF NOT EXISTS `cms_users` (
                        `usr_id` int(11) NOT NULL AUTO_INCREMENT,
                        `users_name` varchar(64) NOT NULL,
                        `password` longtext NOT NULL,
                        `auth_key` varchar(64) NOT NULL,
                        `password_reset_token` varchar(255) DEFAULT NULL,
                        `full_name` varchar(50) NOT NULL,
                        `email` varchar(320) DEFAULT NULL,
                        `status` varchar(1) DEFAULT '1',
                        `create_time` int(11) DEFAULT NULL,
                        `create_user` int(11) DEFAULT NULL,
                        `update_time` int(11) DEFAULT NULL,
                        `update_user` int(11) DEFAULT NULL,
                        `user_type` int(11) DEFAULT NULL,
                        `record_date` int(11) DEFAULT NULL,
                        `loc_code` text DEFAULT NULL,
                        `signedin_loc` varchar(50) DEFAULT NULL,
                        `state_code` varchar(50) DEFAULT NULL,
                        `user_role` smallint(6) DEFAULT NULL,
                        PRIMARY KEY (`usr_id`),
                        UNIQUE KEY `users_name` (`users_name`)
                    ) ENGINE=InnoDB DEFAULT CHARSET=latin1;
                ")->execute();
            } catch (\Throwable $e) {}

            $defaultUsers = [
                ['admin_user', 'admin123', 'key_admin_user_2026', 'System Administrator', 'admin@yrgcare.org', '1', 'Dharavi', 'Admin', 'Full Access', 1],
                ['admin', 'admin123', 'key_admin_2026', 'System Administrator', 'admin@yrgcare.org', '1', 'Dharavi', 'Admin', 'Full Access', 1],
                ['deo', 'deo', 'key_deo_2026', 'Field Supervisor DEO', 'deo@yrgcare.org', '1', 'Dharavi', 'Field Supervisor', 'Dharavi Center', 2],
                ['nurse', 'nurse', 'key_nurse_2026', 'Clinical Staff Nurse', 'nurse@yrgcare.org', '1', 'Dharavi', 'Staff Nurse', 'Dharavi Center', 3],
                ['doctor', 'doctor', 'key_doctor_2026', 'Clinical Doctor', 'doctor@yrgcare.org', '1', 'Dharavi', 'Doctor', 'Dharavi Center', 4],
                ['counselor', 'counselor', 'key_counselor_2026', 'Mental Health Counselor', 'counselor@yrgcare.org', '1', 'Dharavi', 'Counselor', 'Dharavi Center', 5],
                ['coordinator', 'coordinator', 'key_coordinator_2026', 'Case Management Coordinator', 'coordinator@yrgcare.org', '1', 'Dharavi', 'Case Coordinator', 'Dharavi Center', 6],
            ];

            foreach ($defaultUsers as $u) {
                try {
                    $exists = (new \yii\db\Query())->from('cms_users')->where(['users_name' => $u[0]])->exists($db);
                    if (!$exists) {
                        $db->createCommand()->insert('cms_users', [
                            'users_name' => $u[0],
                            'password' => $u[1],
                            'auth_key' => $u[2],
                            'full_name' => $u[3],
                            'email' => $u[4],
                            'status' => $u[5],
                            'loc_code' => $u[6],
                            'state_code' => $u[7],
                            'signedin_loc' => $u[8],
                            'user_role' => $u[9]
                        ])->execute();
                    }
                } catch (\Throwable $e) {}
            }

            try {
                $db->createCommand("
                    CREATE TABLE IF NOT EXISTS `cms_locationmaster` (
                        `loc_id` int(11) NOT NULL AUTO_INCREMENT,
                        `state_code` varchar(10) DEFAULT 'MH',
                        `loc_code` varchar(10) NOT NULL,
                        `loc_name` varchar(255) NOT NULL,
                        `loc_state` varchar(100) DEFAULT 'Maharashtra',
                        `loc_district` varchar(100) DEFAULT 'Mumbai',
                        `loc_city` varchar(100) NOT NULL,
                        `status` varchar(1) DEFAULT '1',
                        PRIMARY KEY (`loc_id`),
                        UNIQUE KEY `loc_code` (`loc_code`)
                    ) ENGINE=InnoDB DEFAULT CHARSET=latin1;
                ")->execute();

                $defaultLocs = [
                    ['MH', 'DH', 'Dharavi Center', 'Maharashtra', 'Mumbai', 'Dharavi', '1'],
                    ['MH', 'ML', 'Malvani Center', 'Maharashtra', 'Mumbai Suburbs', 'Malvani', '1'],
                    ['MH', 'VA', 'Vashi Center', 'Maharashtra', 'Navi Mumbai', 'Vashi', '1'],
                ];

                foreach ($defaultLocs as $l) {
                    try {
                        $locExists = (new \yii\db\Query())->from('cms_locationmaster')->where(['loc_code' => $l[1]])->exists($db);
                        if (!$locExists) {
                            $db->createCommand()->insert('cms_locationmaster', [
                                'state_code' => $l[0],
                                'loc_code' => $l[1],
                                'loc_name' => $l[2],
                                'loc_state' => $l[3],
                                'loc_district' => $l[4],
                                'loc_city' => $l[5],
                                'status' => $l[6]
                            ])->execute();
                        }
                    } catch (\Throwable $e) {}
                }
            } catch (\Throwable $e) {}

        } catch (\Throwable $e) {}
    }
}
