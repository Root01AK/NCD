<?php

namespace app\base;

use Yii;

class Currency
{
    public static $nwords = ["", "one", "two", "three", "four", "five", "six", 
                        "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", 
                        "fourteen", "fifteen", "sixteen", "seventeen", "eightteen", 
                       "nineteen", "twenty", 30 => "thirty", 40 => "fourty",
                             50 => "fifty", 60 => "sixty", 70 => "seventy", 80 => "eigthy",
                             90 => "ninety"];

    public static function number_to_words($x)
    {
         if(!is_numeric($x))
         {
             $w = '#';
         }else if(fmod($x, 1) != 0)
         {
             $w = '#';
         }else{
             if($x < 0)
             {
                 $w = 'minus ';
                 $x = -$x;
             }else{
                 $w = '';
             }
             if($x < 21)
             {
                 $w .= self::$nwords[$x];
             }else if($x < 100)
             {
                 $w .= self::$nwords[10 * floor($x/10)];
                 $r = fmod($x, 10);
                 if($r > 0)
                 {
                     $w .= ' '. self::$nwords[$r];
                 }
             } else if($x < 1000)
             {
    		
                 	$w .= self::$nwords[floor($x/100)] .' hundred';
                 $r = fmod($x, 100);
                 if($r > 0)
                 {
                     $w .= ' '. self::number_to_words($r);
                 }
             } else if($x < 100000)
             {
             	$w .= self::number_to_words(floor($x/1000)) .' thousand';
                $r = fmod($x, 1000);
                 if($r > 0)
                 {
                     $w .= ' ';
                     if($r < 100)
                     {
                         $w .= ' ';
                     }
                     $w .= self::number_to_words($r);
                 }
             } else if($x < 10000000)
             {
             	if(floor($x/100000) == 1) {
    				$w .= self::number_to_words(floor($x/100000)) .' lakh';
    			} else {
    				$w .= self::number_to_words(floor($x/100000)) .' lakhs';
    			}
                 $r = fmod($x, 100000);
                 if($r > 0)
                 {
                     $w .= ' ';
                     if($r < 100)
                     {
                         $w .= ' ';
                     }
                     $w .= self::number_to_words($r);
                 }
             } else {
                 if(floor($x/10000000) == 1) {
    			 	$w .= self::number_to_words(floor($x/10000000)) .' crore';
    			 } else {
    			 	$w .= self::number_to_words(floor($x/10000000)) .' crores';
    			}
                 $r = fmod($x, 10000000);
                 if($r > 0)
                 {
                     $w .= ' ';
                     if($r < 100)
                     {
                         $word .= ' ';
                     }
                     $w .= self::number_to_words($r);
                 }
             }
         }
         return ucwords($w);
    }
}
?>