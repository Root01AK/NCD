<?php

namespace app\models;

use Yii;

class DynamicModel extends \yii\db\ActiveRecord
{
	private static $_tableName;

	public static function tableName()
	{
		// return '{{%'.self::$_tableName.'}}';
		return self::$_tableName;
	}

	public function setTableName($tableName)
	{
		self::$_tableName = $tableName;
	}
}
