<?php

namespace app\modules\api\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;

class DashboardController extends Controller
{
    /**
     * Disable CSRF validation for REST API
     */
    public $enableCsrfValidation = false;

    /**
     * Setup Behaviors (CORS)
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
                'Origin' => ['*'],
                'Access-Control-Request-Method' => ['GET', 'POST', 'OPTIONS'],
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
     * Get list of all screenings from cms_mdhl table
     */
    public function actionScreeninglist()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        try {
            $query = (new \yii\db\Query())->from('{{%mdhl}}')->orderBy(["mem_scrn_part_id" => SORT_DESC]);
            $screenings = $query->all();
            
            return [
                'status' => 'success',
                'data' => $screenings
            ];
        } catch (\Throwable $e) {
            return [
                'status' => 'success',
                'data' => []
            ];
        }
    }

    /**
     * Get list of eligible participants
     */
    public function actionEligiblelist()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        try {
            $query = (new \yii\db\Query())->from('{{%mdhl}}')->where(['mem_scrn_q24' => 1])->orderBy(["mem_scrn_part_id" => SORT_ASC]);
            $eligible = $query->all();
            
            return [
                'status' => 'success',
                'data' => $eligible
            ];
        } catch (\Throwable $e) {
            return [
                'status' => 'success',
                'data' => []
            ];
        }
    }
    
    /**
     * Get list of enrolled participants
     */
    public function actionEnrolledlist()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        try {
            $query = (new \yii\db\Query())->from('{{%mdhl}}')->where(['mem_scrn_q25' => 1])->orderBy(["mem_scrn_part_id" => SORT_ASC]);
            $enrolled = $query->all();
            
            return [
                'status' => 'success',
                'data' => $enrolled
            ];
        } catch (\Throwable $e) {
            return [
                'status' => 'success',
                'data' => []
            ];
        }
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
        } catch (\Throwable $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }
}
