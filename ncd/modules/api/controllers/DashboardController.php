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

        // Ensure these endpoints are protected by JWT Token!
        $behaviors['authenticator'] = [
            'class' => JwtHttpBearerAuth::class,
            'optional' => ['options'], // OPTIONS method should not require auth (for CORS preflight)
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
     * Get list of all screenings
     */
    public function actionScreeninglist()
    {
        try {
            $query = (new \yii\db\Query())->from('{{%screening}}')->orderBy(["mem_scrn_part_id" => SORT_ASC]);
            $screenings = $query->all();
        } catch (\Exception $e) {
            try {
                $query = (new \yii\db\Query())->from('{{%dg}}')->orderBy(["dg_id" => SORT_ASC]);
                $screenings = $query->all();
            } catch (\Exception $ex) {
                $screenings = [];
            }
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
            $query = (new \yii\db\Query())->from('{{%screening}}')->where(['mem_scrn_q24' => 1])->orderBy(["mem_scrn_part_id" => SORT_ASC]);
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
            $query = (new \yii\db\Query())->from('{{%screening}}')->where(['mem_scrn_q25' => 1])->orderBy(["mem_scrn_part_id" => SORT_ASC]);
            $enrolled = $query->all();
        } catch (\Exception $e) {
            $enrolled = [];
        }

        return [
            'status' => 'success',
            'data' => $enrolled
        ];
    }
}
