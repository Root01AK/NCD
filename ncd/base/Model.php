<?php

namespace app\base;

use Yii;
use yii\helpers\ArrayHelper;

class Model extends \yii\base\Model
{
    /**
     * Creates and populates a set of models.
     *
     * @param string $modelClass
     * @param array $multipleModels
     * @return array
     */
    public static function createMultiple($modelClass, $multipleModels = [], $key = "")
    {
        $model    = new $modelClass;
        $formName = $model->formName();
        $post     = Yii::$app->request->post($formName);
        $models   = [];

        if (! empty($multipleModels) && ! empty($key)) {
            $keys = array_keys(ArrayHelper::map($multipleModels, $key, $key));
            $multipleModels = array_combine($keys, $multipleModels);
        }

        if ($post && is_array($post)) {
            foreach ($post as $i => $item) {
                if(is_array($item)) {
                    if (isset($item[$key]) && !empty($item[$key]) && isset($multipleModels[$item[$key]])) {
                        $models[] = $multipleModels[$item[$key]];
                    } else {
                        $models[] = new $modelClass;
                    }
                }
            }
        }

        unset($model, $formName, $post);

        return $models;
    }
}