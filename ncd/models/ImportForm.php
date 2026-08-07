<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\helpers\Json;

/**
 * ImportForm is the model behind the import form.
 */
class ImportForm extends Model
{
    public $name;
    public $file;
    public $clear;
    public $type;
    public $list;
    public $types = ['xls' => 'Excel', 'xlsx' => 'Excel 2007', 'csv' => 'Comma-Separated Values (CSV)'];

    public function init()
    {
        if(file_exists('results.json')) {
            $content = file_get_contents('results.json');
            $this->list = Json::decode($content);
            asort($this->list);
        }
    }

    /**
     * @return array the validation rules.
     */
    public function rules()
    {
        return [
            // name and file are required
            [['name', 'file'], 'required'],
            [['clear', 'type'], 'safe'],
            [['file'], 'file', 'skipOnEmpty' => false, 'extensions' => 'csv, xls, xlsx', 'checkExtensionByMimeType' => false],
        ];
    }

    /**
     * @return array customized attribute labels
     */
    public function attributeLabels()
    {
        return [
            'name' => 'Form Name',
            'file' => 'Upload Data File',
            'clear' => 'Truncate Table?',
            'type' => 'Type',
        ];
    }
}
