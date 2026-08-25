<?php

namespace app\modules\api\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;

class ScreeningController extends Controller
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
                'Access-Control-Request-Method' => ['POST', 'OPTIONS'],
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

    public function actionSubmit()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        try {
            $payload = $this->getPayload();

            if (empty($payload)) {
                Yii::$app->response->statusCode = 400;
                return ['status' => 'error', 'message' => 'No data received'];
            }

            $db = Yii::$app->db;
            $tableName = 'cms_screening';
            
            $partId = $payload['mem_scrn_part_id'] ?? ($payload['participant_id'] ?? ('NCD-MUM-' . rand(1000, 9999)));
            $payload['mem_scrn_part_id'] = $partId;
            $payload['record_date'] = time();

            $existing = (new \yii\db\Query())
                ->from($tableName)
                ->where(['mem_scrn_part_id' => $partId])
                ->one();

            if ($existing) {
                $oldJson = !empty($existing['mem_scrn_q30']) ? json_decode($existing['mem_scrn_q30'], true) : [];
                if (!is_array($oldJson)) $oldJson = [];
                
                $merged = array_merge($oldJson, $payload);
                $merged['mem_scrn_q30'] = json_encode($merged);
                
                $updateCols = [
                    'mem_scrn_q16' => $merged['fullName'] ?? $merged['mem_scrn_q16'] ?? $existing['mem_scrn_q16'],
                    'mem_scrn_q1' => (int)($merged['age'] ?? $merged['mem_scrn_q1'] ?? $existing['mem_scrn_q1']),
                    'mem_scrn_q2' => ($merged['gender'] === 'Male' || $merged['mem_scrn_q2'] == '1') ? '1' : '2',
                    'mem_scrn_q17' => $merged['location'] ?? $merged['mem_scrn_q17'] ?? $existing['mem_scrn_q17'],
                    'mem_scrn_q30' => $merged['mem_scrn_q30'],
                    'update_time' => time()
                ];

                $db->createCommand()->update($tableName, $updateCols, ['mem_scrn_part_id' => $partId])->execute();
            } else {
                $payload['mem_scrn_q30'] = json_encode($payload);
                $insertCols = [
                    'mem_scrn_part_id' => $partId,
                    'mem_scrn_q16' => $payload['fullName'] ?? $payload['mem_scrn_q16'] ?? 'Participant',
                    'mem_scrn_q1' => (int)($payload['age'] ?? $payload['mem_scrn_q1'] ?? 45),
                    'mem_scrn_q2' => ($payload['gender'] === 'Male' || $payload['mem_scrn_q2'] == '1') ? '1' : '2',
                    'mem_scrn_q17' => $payload['location'] ?? $payload['mem_scrn_q17'] ?? 'Dharavi',
                    'mem_scrn_q30' => $payload['mem_scrn_q30'],
                    'record_date' => time(),
                    'status' => '1'
                ];

                $db->createCommand()->insert($tableName, $insertCols)->execute();
            }

            return [
                'status' => 'success',
                'message' => 'Screening section saved successfully',
                'participant_id' => $partId
            ];

        } catch (\Throwable $e) {
            Yii::$app->response->statusCode = 500;
            return [
                'status' => 'error',
                'message' => 'Failed to save screening data: ' . $e->getMessage()
            ];
        }
    }

    public function actionDelete()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        try {
            $payload = $this->getPayload();
            $partId = $payload['mem_scrn_part_id'] ?? $payload['participant_id'] ?? null;
            $id = $payload['mem_scrn_id'] ?? null;

            if (!$partId && !$id) {
                Yii::$app->response->statusCode = 400;
                return ['status' => 'error', 'message' => 'Participant ID required'];
            }

            $db = Yii::$app->db;
            if ($id) {
                $db->createCommand()->delete('cms_mdhl', ['mem_scrn_id' => $id])->execute();
            }
            if ($partId) {
                $db->createCommand()->delete('cms_mdhl', ['mem_scrn_part_id' => $partId])->execute();
                try { $db->createCommand()->delete('cms_apm', ['apm_pid' => $partId])->execute(); } catch (\Throwable $e) {}
                try { $db->createCommand()->delete('cms_bsr', ['bsr_pid' => $partId])->execute(); } catch (\Throwable $e) {}
                try { $db->createCommand()->delete('cms_ce', ['ce_pid' => $partId])->execute(); } catch (\Throwable $e) {}
                try { $db->createCommand()->delete('cms_cml', ['cml_pid' => $partId])->execute(); } catch (\Throwable $e) {}
                try { $db->createCommand()->delete('cms_cprca', ['cprca_pid' => $partId])->execute(); } catch (\Throwable $e) {}
                try { $db->createCommand()->delete('cms_dg', ['dg_pid' => $partId])->execute(); } catch (\Throwable $e) {}
                try { $db->createCommand()->delete('cms_fupm', ['fupm_pid' => $partId])->execute(); } catch (\Throwable $e) {}
                try { $db->createCommand()->delete('cms_vital', ['vital_pid' => $partId])->execute(); } catch (\Throwable $e) {}
            }

            return ['status' => 'success', 'message' => 'Participant screening record deleted successfully'];
        } catch (\Throwable $e) {
            Yii::$app->response->statusCode = 500;
            return ['status' => 'error', 'message' => 'Failed to delete record: ' . $e->getMessage()];
        }
    }
}
