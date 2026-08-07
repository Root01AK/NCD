<?php

namespace app\models;

use Yii;
use yii\base\Model;

/**
 * Exportmaster is the model behind the import form.
 */
class Exportmaster extends Model
{
    public $name;
    public $desc;
    public $chk;

    /**
     * @return array the validation rules.
     */
    public function rules()
    {
        return [
            // name and file are required
            [['name'], 'required'],
            [['desc'], 'required', 'when' => function ($model) {
				return ($model->chk == 1);
			}, 'whenClient' => "function (attribute, value) {
				// return ($('#hivvisit-hiv_visit_q4').val() == 1);
			}"],
            ['chk', 'safe'],
        ];
    }

    /**
     * @return array customized attribute labels
     */
    public function attributeLabels()
    {
        return [
            'name' => 'Table Name',
            'desc' => 'Description',
        ];
    }
}
