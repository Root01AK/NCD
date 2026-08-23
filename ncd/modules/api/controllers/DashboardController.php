<?php

namespace app\modules\api\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use bizley\jwt\JwtHttpBearerAuth;

class DashboardController extends Controller
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
                'Access-Control-Request-Method' => ['GET', 'POST', 'OPTIONS'],
                'Access-Control-Request-Headers' => ['*'],
                'Access-Control-Allow-Credentials' => true,
                'Access-Control-Max-Age' => 3600,
                'Access-Control-Expose-Headers' => ['*'],
            ],
        ];

        // Ensure public API optional auth
        $behaviors['authenticator'] = [
            'class' => JwtHttpBearerAuth::class,
            'optional' => ['options', 'screeninglist', 'resetdatabase'],
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
     * Get list of all screenings from cms_mdhl table
     */
    public function actionScreeninglist()
    {
        try {
            $query = (new \yii\db\Query())->from('{{%mdhl}}')->orderBy(["mem_scrn_part_id" => SORT_DESC]);
            $screenings = $query->all();
        } catch (\Exception $e) {
            $screenings = [];
        }
            
        return [
            'status' => 'success',
            'data' => $screenings
        ];
    }

    /**
     * Get list of eligible participants
     */
    public function actionEligiblelist()
    {
        try {
            $query = (new \yii\db\Query())->from('{{%mdhl}}')->where(['mem_scrn_q24' => 1])->orderBy(["mem_scrn_part_id" => SORT_ASC]);
            $eligible = $query->all();
        } catch (\Exception $e) {
            $eligible = [];
        }

        return [
            'status' => 'success',
            'data' => $eligible
        ];
    }
    
    /**
     * Get list of enrolled participants
     */
    public function actionEnrolledlist()
    {
        try {
            $query = (new \yii\db\Query())->from('{{%mdhl}}')->where(['mem_scrn_q25' => 1])->orderBy(["mem_scrn_part_id" => SORT_ASC]);
            $enrolled = $query->all();
        } catch (\Exception $e) {
            $enrolled = [];
        }

        return [
            'status' => 'success',
            'data' => $enrolled
        ];
    }

    /**
     * Purge and truncate all screening database tables
     */
    public function actionResetdatabase()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $tables = [
            'cms_mdhl',
            'cms_apm',
            'cms_bsr',
            'cms_ce',
            'cms_cml',
            'cms_cprca',
            'cms_dg',
            'cms_fupm',
            'cms_mortalityform',
            'cms_trackingform',
            'cms_vital'
        ];

        try {
            $db = Yii::$app->db;
            $db->createCommand("SET FOREIGN_KEY_CHECKS = 0;")->execute();
            foreach ($tables as $t) {
                $db->createCommand("TRUNCATE TABLE `$t`;")->execute();
            }
            $db->createCommand("SET FOREIGN_KEY_CHECKS = 1;")->execute();

            return [
                'status' => 'success',
                'message' => 'All screening tables truncated successfully!'
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }
}
