<?php

namespace app\base;

use DateTime;
use Yii;

class Converter
{
    public static function date($dateStr, $type = "store", $format = null)
    {
    	$dateStr = str_replace("-", "/", $dateStr);
		if($type == "store") {
			if(strtolower($format) == "dd/mm/yyyy" || strtolower($format) == "dd-mm-yyyy")
				list($d, $m, $y) = explode('/', $dateStr);
			// elseif(strtolower($format) == "dd-mm-yyyy")
				// list($d, $m, $y) = explode('/', $dateStr);
			else
				list($y, $m, $d) = explode('/', $dateStr);
			
			$dateStr = "$y/$m/$d";
			return Yii::$app->formatter->format($dateStr, "timestamp");
		} else {
			// return Yii::$app->formatter->asDate($dateStr, Yii::$app->params["dateFormat"]);
			return Yii::$app->formatter->asDate($dateStr, Yii::$app->formatter->dateFormat);
		}
    }

	public static function toStore($dateStr, $format = null)
	{
		return self::toUnixTimeformat($dateStr);
    	if($dateStr != "") {
	    	$dateStr = str_replace("-", "/", $dateStr);
			if(strtolower(Yii::$app->formatter->dateFormat) == "dd/mm/yyyy" || strtolower(Yii::$app->formatter->dateFormat) == "dd-mm-yyyy")
				list($d, $m, $y) = explode('/', $dateStr);
			// elseif(strtolower(Yii::$app->formatter->dateFormat) == "dd-mm-yyyy")
				// list($d, $m, $y) = explode('/', $dateStr);
			else 
				list($y, $m, $d) = explode('/', $dateStr);
			$dateStr = "$y/$m/$d";
			
			if($format == null)
				return Yii::$app->formatter->format($dateStr, "timestamp");
			else
				return Yii::$app->formatter->format($dateStr, $format);
	    } else {
	    	return "";
	    }
    }

    public static function toDisplay($dateStr, $format = null)
    {
		if($format == null)
			return Yii::$app->formatter->asDate($dateStr, Yii::$app->formatter->dateFormat);
		else
			return Yii::$app->formatter->asDate($dateStr, $format);
    }

    public static function toUnixTimeformat($dateStr)
    {
    	if($dateStr != "") {
	        $date = DateTime::createFromFormat(self::formatterForm(), $dateStr);
	        $date->setTime(0,0,0);
	        return $date->getTimeStamp();
	    } else {
	    	return "";
	    }
    }

    public static function formatterForm()
    {
    	$format = strtolower(Yii::$app->formatter->dateFormat);
		if($format == "dd-mm-yyyy")
			return "d-m-Y";
		elseif($format == "mm-dd-yyyy")
			return "m-d-Y";
		elseif($format == "yyyy-mm-dd")
			return "Y-m-d";
		else
			return "d-m-Y";
    }
}