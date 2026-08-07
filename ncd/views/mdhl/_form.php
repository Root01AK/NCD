<?php

use yii\web\View;
use app\base\Common;
use yii\helpers\Url;
use yii\helpers\Html;
use yii\widgets\ActiveForm;

/* @var $this yii\web\View */
/* @var $model app\models\Mdhl */
/* @var $form yii\widgets\ActiveForm */

$Surveys = Common::getSurvey();
$Locations = Common::getLocations();
$Locmap = Common::getLocmap();
$Location= Common::getSitelocation();
$Signedinloc=Common::getSigninLoc();
$PIDs = Common::getEnrollPIDs("mdhl");

if(Yii::$app->params['SURVEY'] != '') {
	$Locations = Common::getSurlocations(Yii::$app->params['SURVEY']);
}
if(Yii::$app->params['SURVEY'] != '' && Yii::$app->params['LOCATION'] != '') {
	$Locations = Common::getSurlocations(Yii::$app->params['SURVEY']);
	//$PIDs = Common::getClientid(Yii::$app->params['SURVEY'], Yii::$app->params['LOCATION']);
}

$headJS = <<<JS
   function change_q19()
	{
	  	  if($('#mdhl-mdhl_q19').val() != '' ) {	
			  
          if($('#mdhl-mdhl_q19').val() == 1 && $('#mdhl-mdhl_q19a-5').prop('checked')) {					
               $('div.form-group.field-mdhl-mdhl_q19b').addClass('required').show();	
			}			  
		    else {
			   $('div.form-group.field-mdhl-mdhl_q19b').removeClass('required').hide();
			   $('#mdhl-mdhl_q19b').val(''); 
			}
		  }
		   else {
		       $('div.form-group.field-mdhl-mdhl_q19b').removeClass('required').hide();
			   $('#mdhl-mdhl_q19b').val(''); 
			}
			
	}	

	
  function change_q13()
	{
	  	  if($('#mdhl-mdhl_q13a').val() != '' || $('#mdhl-mdhl_q13b').val() != '') {	
			  
		  if(($('#mdhl-mdhl_q13a').val() != '' && $('#mdhl-mdhl_q13a').val() == 1) || ($('#mdhl-mdhl_q13b').val() != '' && $('#mdhl-mdhl_q13b').val() == 1)) {
			  
             $('.form-gad').show();              			 
		  }			  
		   else {
			 $('.form-gad').hide();               			 
			  $('#mdhl-gad_q1 input[type=radio],#mdhl-gad_q2 input[type=radio],#mdhl-gad_q3 input[type=radio],#mdhl-gad_q4 input[type=radio],#mdhl-gad_q5 input[type=radio],#mdhl-gad_q6 input[type=radio],#mdhl-gad_q7 input[type=radio]').prop('checked', false) ;
			 $('#mdhl-gad_q8').val('');
             $('#mdhl-gad_tot_score,#mdhl-gad_anxiety_severity').val('');

			$('#mdhl input[type=radio]').each(function(){
			   $(this)[0].checked = false;  
			  });			 
			 			 
			}
		  }
		   else {
			 $('.form-gad').hide();  
		     $('#mdhl-gad_q1 input[type=radio],#mdhl-gad_q2 input[type=radio],#mdhl-gad_q3 input[type=radio],#mdhl-gad_q4 input[type=radio],#mdhl-gad_q5 input[type=radio],#mdhl-gad_q6 input[type=radio],#mdhl-gad_q7 input[type=radio]').prop('checked', false) ;
			 $('#mdhl-gad_q8').val('');		
			 $('#mdhl-gad_tot_score,#mdhl-gad_anxiety_severity').val('');	
		 }
	  
    }
        		
	  function change_q15()
	{
	  	  if($('#mdhl-mdhl_q15a').val() != '' || $('#mdhl-mdhl_q15b').val() != '') {	
			  
		  if(($('#mdhl-mdhl_q15a').val() != '' && $('#mdhl-mdhl_q15a').val() == 1) || ($('#mdhl-mdhl_q15b').val() != '' && $('#mdhl-mdhl_q15b').val() == 1)) {
			  
             $('.form-phq').show();              			 
		  }			  
		   else {
			 $('.form-phq').hide();               			 
			 $('#mdhl-phq_q1 input[type=radio],#mdhl-phq_q2 input[type=radio],#mdhl-phq_q3 input[type=radio],#mdhl-phq_q4 input[type=radio],#mdhl-phq_q5 input[type=radio],#mdhl-phq_q6 input[type=radio],#mdhl-phq_q7 input[type=radio],#mdhl-phq_q8 input[type=radio],#mdhl-phq_q9 input[type=radio]').prop('checked', false) ;
			 $('#mdhl-phq_q10').val('');
             $('#mdhl-phq_tot_score,#mdhl-phq_depression_severity').val('');			 
			 			 
			}
		  }
		   else {
			 $('.form-phq').hide();  
			 $('#mdhl-phq_q1 input[type=radio],#mdhl-phq_q2 input[type=radio],#mdhl-phq_q3 input[type=radio],#mdhl-phq_q4 input[type=radio],#mdhl-phq_q5 input[type=radio],#mdhl-phq_q6 input[type=radio],#mdhl-phq_q7 input[type=radio],#mdhl-phq_q8 input[type=radio],#mdhl-phq_q9 input[type=radio]').prop('checked', false) ;
			 $('#mdhl-phq_q10').val('');
             $('#mdhl-phq_tot_score,#mdhl-phq_depression_severity').val('');			
		 }
	  
    }
        	
	
JS;
$this->registerJs($headJS, View::POS_HEAD);


$JS = "
	$('.datepicker').datepicker({autoclose: true, startDate: '01-01-1900', endDate: '0', format: '".strtolower(Yii::$app->formatter->dateFormat)."'});
			
	$('#mdhl-mdhl_pid').on('select2:select', function (evt) {
		var pid = $(this)[0].value;		
		if(pid != '') {
			var link = $('#pid-info').data('link') + pid;			
			$.ajax({
				type: 'post',
				url: 'getpid',
				data: 'pid='+$(this)[0].value,
				success: function(response) {					
					if(response != null) {
						$('#mdhl-mdhl_date').val(response);						
					} else {
						$('#mdhl-mdhl_date').val('');						
					}
					
				}
			});
		}
	});		
	
	$('#mdhl-mdhl_pid').on('select2:unselect', function (evt) {
		$('#mdhl-mdhl_date').val('');		
	});
	
		
     $('#mdhl-mdhl_q6-6').change(function(){
		// $('div.form-group').show();
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).prop('checked')) {
			$('div.form-group.field-mdhl-mdhl_q6a').addClass('required').show();
		  } 
	    else { $('div.form-group.field-mdhl-mdhl_q6a').removeClass('required').hide();
           $('#mdhl-mdhl_q6a').val('');			
		}
	});
	
	$('#mdhl-mdhl_q7').change(function(){	
		$('div.help-block').html('');
		$('div.error-summary').hide();
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		 if($(this).val() != '1') {	
		     $('div.form-group.field-mdhl-mdhl_q7a').removeClass('required').hide();
			 $('#mdhl-mdhl_q7a-1,#mdhl-mdhl_q7a-2,#mdhl-mdhl_q7a-3,#mdhl-mdhl_q7a-4,#mdhl-mdhl_q7a-5').prop('checked', false) ;           
			 
		} else {		  
			$('div.form-group.field-mdhl-mdhl_q7a').addClass('required').show();	
		}
		
	});	
	
	$('#mdhl-mdhl_q8').change(function(){
		// $('div.form-group').show();
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).val() == '1') {
			$('div.form-group.field-mdhl-mdhl_q8a').addClass('required').show();
		} else {
			$('div.form-group.field-mdhl-mdhl_q8a').removeClass('required').hide();
			
			$('#mdhl-mdhl_q8a').val('');
		}
	});
	
	
	$('#mdhl-mdhl_q9').change(function(){
		// $('div.form-group').show();
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).val() == '1') {
			$('div.form-group.field-mdhl-mdhl_q9a').addClass('required').show();
		} else {
			$('div.form-group.field-mdhl-mdhl_q9a').removeClass('required').hide();
			
			$('#mdhl-mdhl_q9a').val('');
		}
	});
	
		
	$('#mdhl-mdhl_q19').change(function(){
		// $('div.form-group').show();
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).val() == 1) {
			$('div.form-group.field-mdhl-mdhl_q19a').addClass('required').show();
		} else {
			$('div.form-group.field-mdhl-mdhl_q19a,div.form-group.field-mdhl-mdhl_q19b').removeClass('required').hide();
			$('#mdhl-mdhl_q19a-1,#mdhl-mdhl_q19a-2,#mdhl-mdhl_q19a-3,#mdhl-mdhl_q19a-4,#mdhl-mdhl_q19a-5').prop('checked', false);
			$('#mdhl-mdhl_q19b').val('');
		}
	});
	
	$('#mdhl-mdhl_q6-1').change(function(){
		// $('div.form-group').show();
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).prop('checked')) {
		   $('#mdhl-mdhl_q6-2,#mdhl-mdhl_q6-3,#mdhl-mdhl_q6-4,#mdhl-mdhl_q6-5,#mdhl-mdhl_q6-6,#mdhl-mdhl_q6-7').prop('checked', false).prop('disabled', true);  
           $('div.form-group.field-mdhl-mdhl_q6a').removeClass('required').hide();
           $('#mdhl-mdhl_q6a').val('');	
		  } 
	    else  
		   $('#mdhl-mdhl_q6-2,#mdhl-mdhl_q6-3,#mdhl-mdhl_q6-4,#mdhl-mdhl_q6-5,#mdhl-mdhl_q6-6,#mdhl-mdhl_q6-7').prop('disabled', false);  
       
	});
	
	$('#mdhl-mdhl_q6-2,#mdhl-mdhl_q6-3,#mdhl-mdhl_q6-4,#mdhl-mdhl_q6-5,#mdhl-mdhl_q6-6,#mdhl-mdhl_q6-7').change(function(){
		// $('div.form-group').show();
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($('#mdhl-mdhl_q6-2').prop('checked') || $('#mdhl-mdhl_q6-3').prop('checked')|| $('#mdhl-mdhl_q6-4').prop('checked')|| $('#mdhl-mdhl_q6-5').prop('checked')|| $('#mdhl-mdhl_q6-6').prop('checked')|| $('#mdhl-mdhl_q6-7').prop('checked')) 
		   $('#mdhl-mdhl_q6-1').prop('checked', false).prop('disabled', true); 
	    else  
		   $('#mdhl-mdhl_q6-1').prop('disabled', false);  
       
	});
	
	
	$('#mdhl-mdhl_q19, #mdhl-mdhl_q19a input[type=checkbox]').change(function(){
		change_q19();
	});
	
	$('#mdhl-mdhl_q19, #mdhl-mdhl_q19a input[type=checkbox]').focusout(function(e){
		change_q19();
	});
	
	$('#mdhl-mdhl_q6 input[type=checkbox],#mdhl-mdhl_q7,#mdhl-mdhl_q8,#mdhl-mdhl_q9,#mdhl-mdhl_q19,#mdhl-mdhl_q19a input[type=checkbox]').trigger('change');
	
";

$this->registerJs($JS);

$JS="
  
  $('#mdhl-gad_tot_score').val('');
  
  var q1,q2,q3,q4,q5,q6,q7,tot_score;
  
	$('#mdhl-gad_q1 input[type=radio]').change(function(){	
		$('div.help-block').html('');
		$('div.error-summary').hide();
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).prop('checked')) {
			q1=$(this).val();	
			if(q1== '0' && q2== '0' && q3== '0'&& q4== '0'&& q5== '0'&& q6== '0'&& q7== '0') {
			 $('div.form-group.field-mdhl-gad_q8').removeClass('required').hide();
			 $('#mdhl-gad_q8').val('');
			
		} else {		  
			 $('div.form-group.field-mdhl-gad_q8').addClass('required').show();	
		}
		 
		 tot_score=(typeof(q1) != 'undefined' ? Number(q1) : 0)+(typeof(q2) != 'undefined' ? Number(q2) : 0)+(typeof(q3) != 'undefined' ? Number(q3) : 0)+(typeof(q4) != 'undefined' ? Number(q4) : 0)+(typeof(q5) != 'undefined' ? Number(q5) : 0)+(typeof(q6) != 'undefined' ? Number(q6) : 0)+(typeof(q7) != 'undefined' ? Number(q7) : 0);
		 
         $('#mdhl-gad_tot_score').val(tot_score).trigger('change'); 
		}	   
		
		
		/*
		if (tot_score>0) {
		if (tot_score<5)
			 $('#mdhl-gad_anxiety_severity').val(1);
		 else if (tot_score<10)
			 $('#mdhl-gad_anxiety_severity').val(2);
		 else if (tot_score<15)
			 $('#mdhl-gad_anxiety_severity').val(3);
		 else if (tot_score<20)
			 $('#mdhl-gad_anxiety_severity').val(4);
		 else if (tot_score>20)
			 $('#mdhl-gad_anxiety_severity').val(5);
		}
		*/
		    
	});	
	
	$('#mdhl-gad_q2 input[type=radio]').change(function(){	
		$('div.help-block').html('');
		$('div.error-summary').hide();
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).prop('checked')) {
			q2=$(this).val();	
			if(q1== '0' && q2== '0' && q3== '0'&& q4== '0'&& q5== '0'&& q6== '0'&& q7== '0') {
			 $('div.form-group.field-mdhl-gad_q8').removeClass('required').hide();
			 $('#mdhl-gad_q8').val('');
			
		} else {		  
			 $('div.form-group.field-mdhl-gad_q8').addClass('required').show();	
		}
		
		
         tot_score=(typeof(q1) != 'undefined' ? Number(q1) : 0)+(typeof(q2) != 'undefined' ? Number(q2) : 0)+(typeof(q3) != 'undefined' ? Number(q3) : 0)+(typeof(q4) != 'undefined' ? Number(q4) : 0)+(typeof(q5) != 'undefined' ? Number(q5) : 0)+(typeof(q6) != 'undefined' ? Number(q6) : 0)+(typeof(q7) != 'undefined' ? Number(q7) : 0);
		 
          $('#mdhl-gad_tot_score').val(tot_score).trigger('change'); 
		}
	});	
	
	$('#mdhl-gad_q3 input[type=radio]').change(function(){	
		$('div.help-block').html('');
		$('div.error-summary').hide();
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).prop('checked')) {
			q3=$(this).val();	
			if(q1== '0' && q2== '0' && q3== '0'&& q4== '0'&& q5== '0'&& q6== '0'&& q7== '0') {
			 $('div.form-group.field-mdhl-gad_q8').removeClass('required').hide();
			 $('#mdhl-gad_q8').val('');
			
		} else {		  
			 $('div.form-group.field-mdhl-gad_q8').addClass('required').show();	
		}
			

         tot_score=(typeof(q1) != 'undefined' ? Number(q1) : 0)+(typeof(q2) != 'undefined' ? Number(q2) : 0)+(typeof(q3) != 'undefined' ? Number(q3) : 0)+(typeof(q4) != 'undefined' ? Number(q4) : 0)+(typeof(q5) != 'undefined' ? Number(q5) : 0)+(typeof(q6) != 'undefined' ? Number(q6) : 0)+(typeof(q7) != 'undefined' ? Number(q7) : 0);
		 
          $('#mdhl-gad_tot_score').val(tot_score).trigger('change'); 		
		}
	});	
	
	$('#mdhl-gad_q4 input[type=radio]').change(function(){	
		$('div.help-block').html('');
		$('div.error-summary').hide();
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).prop('checked')) {
			q4=$(this).val();	
			if(q1== '0' && q2== '0' && q3== '0'&& q4== '0'&& q5== '0'&& q6== '0'&& q7== '0') {
			 $('div.form-group.field-mdhl-gad_q8').removeClass('required').hide();
			 $('#mdhl-gad_q8').val('');
			
		} else {		  
			 $('div.form-group.field-mdhl-gad_q8').addClass('required').show();	
		}
			
       
         tot_score=(typeof(q1) != 'undefined' ? Number(q1) : 0)+(typeof(q2) != 'undefined' ? Number(q2) : 0)+(typeof(q3) != 'undefined' ? Number(q3) : 0)+(typeof(q4) != 'undefined' ? Number(q4) : 0)+(typeof(q5) != 'undefined' ? Number(q5) : 0)+(typeof(q6) != 'undefined' ? Number(q6) : 0)+(typeof(q7) != 'undefined' ? Number(q7) : 0);
		 
          $('#mdhl-gad_tot_score').val(tot_score).trigger('change'); 		
		}
	});	
	
	$('#mdhl-gad_q5 input[type=radio]').change(function(){	
		$('div.help-block').html('');
		$('div.error-summary').hide();
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).prop('checked')) {
			q5=$(this).val();	
			if(q1== '0' && q2== '0' && q3== '0'&& q4== '0'&& q5== '0'&& q6== '0'&& q7== '0') {
			 $('div.form-group.field-mdhl-gad_q8').removeClass('required').hide();
			 $('#mdhl-gad_q8').val('');
			
		} else {		  
			 $('div.form-group.field-mdhl-gad_q8').addClass('required').show();	
		}
				
		
         tot_score=(typeof(q1) != 'undefined' ? Number(q1) : 0)+(typeof(q2) != 'undefined' ? Number(q2) : 0)+(typeof(q3) != 'undefined' ? Number(q3) : 0)+(typeof(q4) != 'undefined' ? Number(q4) : 0)+(typeof(q5) != 'undefined' ? Number(q5) : 0)+(typeof(q6) != 'undefined' ? Number(q6) : 0)+(typeof(q7) != 'undefined' ? Number(q7) : 0);
		 
          $('#mdhl-gad_tot_score').val(tot_score).trigger('change'); 
		 }
	});	
	
	$('#mdhl-gad_q6 input[type=radio]').change(function(){	
		$('div.help-block').html('');
		$('div.error-summary').hide();
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).prop('checked')) {
			q6=$(this).val();	
			if(q1== '0' && q2== '0' && q3== '0'&& q4== '0'&& q5== '0'&& q6== '0'&& q7== '0') {
			 $('div.form-group.field-mdhl-gad_q8').removeClass('required').hide();
			 $('#mdhl-gad_q8').val('');
			
		} else {		  
			 $('div.form-group.field-mdhl-gad_q8').addClass('required').show();	
		}
	       
         tot_score=(typeof(q1) != 'undefined' ? Number(q1) : 0)+(typeof(q2) != 'undefined' ? Number(q2) : 0)+(typeof(q3) != 'undefined' ? Number(q3) : 0)+(typeof(q4) != 'undefined' ? Number(q4) : 0)+(typeof(q5) != 'undefined' ? Number(q5) : 0)+(typeof(q6) != 'undefined' ? Number(q6) : 0)+(typeof(q7) != 'undefined' ? Number(q7) : 0);
		 
          $('#mdhl-gad_tot_score').val(tot_score).trigger('change'); 
         
        }		  
		
	});	
	
	$('#mdhl-gad_q7 input[type=radio]').change(function(){	
		$('div.help-block').html('');
		$('div.error-summary').hide();
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).prop('checked')) {
			q7=$(this).val();	
			if(q1== '0' && q2== '0' && q3== '0'&& q4== '0'&& q5== '0'&& q6== '0'&& q7== '0') {
			 $('div.form-group.field-mdhl-gad_q8').removeClass('required').hide();
			 $('#mdhl-gad_q8').val('');
			
		} else {		  
			 $('div.form-group.field-mdhl-gad_q8').addClass('required').show();	
		}
					
		
         tot_score=(typeof(q1) != 'undefined' ? Number(q1) : 0)+(typeof(q2) != 'undefined' ? Number(q2) : 0)+(typeof(q3) != 'undefined' ? Number(q3) : 0)+(typeof(q4) != 'undefined' ? Number(q4) : 0)+(typeof(q5) != 'undefined' ? Number(q5) : 0)+(typeof(q6) != 'undefined' ? Number(q6) : 0)+(typeof(q7) != 'undefined' ? Number(q7) : 0);
		 
          $('#mdhl-gad_tot_score').val(tot_score).trigger('change'); 
		 }
	});	
	

	
	$('#mdhl-gad_tot_score').change(function(){		
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
	     if ($(this).val() != '') {
		 if ($(this).val()<5)
			 $('#mdhl-gad_anxiety_severity').val(1);
		 else if ($(this).val()<10)
			 $('#mdhl-gad_anxiety_severity').val(2);
		 else if ($(this).val()<15)
			 $('#mdhl-gad_anxiety_severity').val(3);
		 else if ($(this).val()>15)
			 $('#mdhl-gad_anxiety_severity').val(4);		
		 }
	    else
         $('#mdhl-gad_anxiety_severity').val('');
	});
		
   
  $('#mdhl-gad_q1 input[type=radio],#mdhl-gad_q2 input[type=radio],#mdhl-gad_q3 input[type=radio],#mdhl-gad_q4 input[type=radio],#mdhl-gad_q5 input[type=radio],#mdhl-gad_q6 input[type=radio],#mdhl-gad_q7 input[type=radio],#mdhl-gad_tot_score').trigger('change');     
	
	";
$this->registerJs($JS);

$JS="
    $('#mdhl-phq_tot_score').val('');
    var q1,q2,q3,q4,q5,q6,q7,q8,q9,tot_score;
  
	$('#mdhl-phq_q1 input[type=radio]').change(function(){	
		$('div.help-block').html('');
		$('div.error-summary').hide();
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).prop('checked')) {
			q1=$(this).val();	
			if(q1== '0' && q2== '0' && q3== '0'&& q4== '0'&& q5== '0'&& q6== '0'&& q7== '0'&& q8== '0' && q9== '0') {
			 $('div.form-group.field-mdhl-phq_q10').removeClass('required').hide();
			 $('#mdhl-phq_q10').val('');
			
		} else {		  
			 $('div.form-group.field-mdhl-phq_q10').addClass('required').show();	
		}
		 
		 tot_score=(typeof(q1) != 'undefined' ? Number(q1) : 0)+(typeof(q2) != 'undefined' ? Number(q2) : 0)+(typeof(q3) != 'undefined' ? Number(q3) : 0)+(typeof(q4) != 'undefined' ? Number(q4) : 0)+(typeof(q5) != 'undefined' ? Number(q5) : 0)+(typeof(q6) != 'undefined' ? Number(q6) : 0)+(typeof(q7) != 'undefined' ? Number(q7) : 0)+(typeof(q8) != 'undefined' ? Number(q8) : 0)+(typeof(q9) != 'undefined' ? Number(q9) : 0);
		 
         $('#mdhl-phq_tot_score').val(tot_score).trigger('change'); 
		}	   
		
		
		/*
		if (tot_score>0) {
		if (tot_score<5)
			 $('#mdhl-phq_depression_severity').val(1);
		 else if (tot_score<10)
			 $('#mdhl-phq_depression_severity').val(2);
		 else if (tot_score<15)
			 $('#mdhl-phq_depression_severity').val(3);
		 else if (tot_score<20)
			 $('#mdhl-phq_depression_severity').val(4);
		 else if (tot_score>20)
			 $('#mdhl-phq_depression_severity').val(5);
		}
		*/
		    
	});	
	
	$('#mdhl-phq_q2 input[type=radio]').change(function(){	
		$('div.help-block').html('');
		$('div.error-summary').hide();
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).prop('checked')) {
			q2=$(this).val();	
			if(q1== '0' && q2== '0' && q3== '0'&& q4== '0'&& q5== '0'&& q6== '0'&& q7== '0'&& q8== '0' && q9== '0') {
			 $('div.form-group.field-mdhl-phq_q10').removeClass('required').hide();
			 $('#mdhl-phq_q10').val('');
			
		} else {		  
			 $('div.form-group.field-mdhl-phq_q10').addClass('required').show();	
		}
		
		
         tot_score=(typeof(q1) != 'undefined' ? Number(q1) : 0)+(typeof(q2) != 'undefined' ? Number(q2) : 0)+(typeof(q3) != 'undefined' ? Number(q3) : 0)+(typeof(q4) != 'undefined' ? Number(q4) : 0)+(typeof(q5) != 'undefined' ? Number(q5) : 0)+(typeof(q6) != 'undefined' ? Number(q6) : 0)+(typeof(q7) != 'undefined' ? Number(q7) : 0)+(typeof(q8) != 'undefined' ? Number(q8) : 0)+(typeof(q9) != 'undefined' ? Number(q9) : 0);
		 
          $('#mdhl-phq_tot_score').val(tot_score).trigger('change'); 
		}
	});	
	
	$('#mdhl-phq_q3 input[type=radio]').change(function(){	
		$('div.help-block').html('');
		$('div.error-summary').hide();
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).prop('checked')) {
			q3=$(this).val();	
			if(q1== '0' && q2== '0' && q3== '0'&& q4== '0'&& q5== '0'&& q6== '0'&& q7== '0'&& q8== '0' && q9== '0') {
			 $('div.form-group.field-mdhl-phq_q10').removeClass('required').hide();
			 $('#mdhl-phq_q10').val('');
			
		} else {		  
			 $('div.form-group.field-mdhl-phq_q10').addClass('required').show();	
		}
			

         tot_score=(typeof(q1) != 'undefined' ? Number(q1) : 0)+(typeof(q2) != 'undefined' ? Number(q2) : 0)+(typeof(q3) != 'undefined' ? Number(q3) : 0)+(typeof(q4) != 'undefined' ? Number(q4) : 0)+(typeof(q5) != 'undefined' ? Number(q5) : 0)+(typeof(q6) != 'undefined' ? Number(q6) : 0)+(typeof(q7) != 'undefined' ? Number(q7) : 0)+(typeof(q8) != 'undefined' ? Number(q8) : 0)+(typeof(q9) != 'undefined' ? Number(q9) : 0);
		 
          $('#mdhl-phq_tot_score').val(tot_score).trigger('change'); 		
		}
	});	
	
	$('#mdhl-phq_q4 input[type=radio]').change(function(){	
		$('div.help-block').html('');
		$('div.error-summary').hide();
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).prop('checked')) {
			q4=$(this).val();	
			if(q1== '0' && q2== '0' && q3== '0'&& q4== '0'&& q5== '0'&& q6== '0'&& q7== '0'&& q8== '0' && q9== '0') {
			 $('div.form-group.field-mdhl-phq_q10').removeClass('required').hide();
			 $('#mdhl-phq_q10').val('');
			
		} else {		  
			 $('div.form-group.field-mdhl-phq_q10').addClass('required').show();	
		}
			
       
         tot_score=(typeof(q1) != 'undefined' ? Number(q1) : 0)+(typeof(q2) != 'undefined' ? Number(q2) : 0)+(typeof(q3) != 'undefined' ? Number(q3) : 0)+(typeof(q4) != 'undefined' ? Number(q4) : 0)+(typeof(q5) != 'undefined' ? Number(q5) : 0)+(typeof(q6) != 'undefined' ? Number(q6) : 0)+(typeof(q7) != 'undefined' ? Number(q7) : 0)+(typeof(q8) != 'undefined' ? Number(q8) : 0)+(typeof(q9) != 'undefined' ? Number(q9) : 0);
		 
          $('#mdhl-phq_tot_score').val(tot_score).trigger('change'); 		
		}
	});	
	
	$('#mdhl-phq_q5 input[type=radio]').change(function(){	
		$('div.help-block').html('');
		$('div.error-summary').hide();
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).prop('checked')) {
			q5=$(this).val();	
			if(q1== '0' && q2== '0' && q3== '0'&& q4== '0'&& q5== '0'&& q6== '0'&& q7== '0'&& q8== '0' && q9== '0') {
			 $('div.form-group.field-mdhl-phq_q10').removeClass('required').hide();
			 $('#mdhl-phq_q10').val('');
			
		} else {		  
			 $('div.form-group.field-mdhl-phq_q10').addClass('required').show();	
		}
				
		
         tot_score=(typeof(q1) != 'undefined' ? Number(q1) : 0)+(typeof(q2) != 'undefined' ? Number(q2) : 0)+(typeof(q3) != 'undefined' ? Number(q3) : 0)+(typeof(q4) != 'undefined' ? Number(q4) : 0)+(typeof(q5) != 'undefined' ? Number(q5) : 0)+(typeof(q6) != 'undefined' ? Number(q6) : 0)+(typeof(q7) != 'undefined' ? Number(q7) : 0)+(typeof(q8) != 'undefined' ? Number(q8) : 0)+(typeof(q9) != 'undefined' ? Number(q9) : 0);
		 
          $('#mdhl-phq_tot_score').val(tot_score).trigger('change'); 
		 }
	});	
	
	$('#mdhl-phq_q6 input[type=radio]').change(function(){	
		$('div.help-block').html('');
		$('div.error-summary').hide();
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).prop('checked')) {
			q6=$(this).val();	
			if(q1== '0' && q2== '0' && q3== '0'&& q4== '0'&& q5== '0'&& q6== '0'&& q7== '0'&& q8== '0' && q9== '0') {
			 $('div.form-group.field-mdhl-phq_q10').removeClass('required').hide();
			 $('#mdhl-phq_q10').val('');
			
		} else {		  
			 $('div.form-group.field-mdhl-phq_q10').addClass('required').show();	
		}
	       
         tot_score=(typeof(q1) != 'undefined' ? Number(q1) : 0)+(typeof(q2) != 'undefined' ? Number(q2) : 0)+(typeof(q3) != 'undefined' ? Number(q3) : 0)+(typeof(q4) != 'undefined' ? Number(q4) : 0)+(typeof(q5) != 'undefined' ? Number(q5) : 0)+(typeof(q6) != 'undefined' ? Number(q6) : 0)+(typeof(q7) != 'undefined' ? Number(q7) : 0)+(typeof(q8) != 'undefined' ? Number(q8) : 0)+(typeof(q9) != 'undefined' ? Number(q9) : 0);
		 
          $('#mdhl-phq_tot_score').val(tot_score).trigger('change'); 
         
        }		  
		
	});	
	
	$('#mdhl-phq_q7 input[type=radio]').change(function(){	
		$('div.help-block').html('');
		$('div.error-summary').hide();
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).prop('checked')) {
			q7=$(this).val();	
			if(q1== '0' && q2== '0' && q3== '0'&& q4== '0'&& q5== '0'&& q6== '0'&& q7== '0'&& q8== '0' && q9== '0') {
			 $('div.form-group.field-mdhl-phq_q10').removeClass('required').hide();
			 $('#mdhl-phq_q10').val('');
			
		} else {		  
			 $('div.form-group.field-mdhl-phq_q10').addClass('required').show();	
		}
					
		
         tot_score=(typeof(q1) != 'undefined' ? Number(q1) : 0)+(typeof(q2) != 'undefined' ? Number(q2) : 0)+(typeof(q3) != 'undefined' ? Number(q3) : 0)+(typeof(q4) != 'undefined' ? Number(q4) : 0)+(typeof(q5) != 'undefined' ? Number(q5) : 0)+(typeof(q6) != 'undefined' ? Number(q6) : 0)+(typeof(q7) != 'undefined' ? Number(q7) : 0)+(typeof(q8) != 'undefined' ? Number(q8) : 0)+(typeof(q9) != 'undefined' ? Number(q9) : 0);
		 
          $('#mdhl-phq_tot_score').val(tot_score).trigger('change'); 
		 }
	});	
	
	$('#mdhl-phq_q8 input[type=radio]').change(function(){	
		$('div.help-block').html('');
		$('div.error-summary').hide();
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).prop('checked')) {
			q8=$(this).val();	
			if(q1== '0' && q2== '0' && q3== '0'&& q4== '0'&& q5== '0'&& q6== '0'&& q7== '0'&& q8== '0' && q9== '0') {
			 $('div.form-group.field-mdhl-phq_q10').removeClass('required').hide();
			 $('#mdhl-phq_q10').val('');
			
		} else {		  
			 $('div.form-group.field-mdhl-phq_q10').addClass('required').show();	
		}
				
		
         tot_score=(typeof(q1) != 'undefined' ? Number(q1) : 0)+(typeof(q2) != 'undefined' ? Number(q2) : 0)+(typeof(q3) != 'undefined' ? Number(q3) : 0)+(typeof(q4) != 'undefined' ? Number(q4) : 0)+(typeof(q5) != 'undefined' ? Number(q5) : 0)+(typeof(q6) != 'undefined' ? Number(q6) : 0)+(typeof(q7) != 'undefined' ? Number(q7) : 0)+(typeof(q8) != 'undefined' ? Number(q8) : 0)+(typeof(q9) != 'undefined' ? Number(q9) : 0);
		 
          $('#mdhl-phq_tot_score').val(tot_score).trigger('change'); 
		 }
	});	
	
	
	 $('#mdhl-phq_q9 input[type=radio]').change(function(){	
		$('div.help-block').html('');
		$('div.error-summary').hide();
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).prop('checked')) {
			q9=$(this).val();	
			if(q1== '0' && q2== '0' && q3== '0'&& q4== '0'&& q5== '0'&& q6== '0'&& q7== '0'&& q8== '0' && q9== '0') {
			 $('div.form-group.field-mdhl-phq_q10').removeClass('required').hide();
			 $('#mdhl-phq_q10').val('');
			
		} else {		  
			 $('div.form-group.field-mdhl-phq_q10').addClass('required').show();	
		}
		
		
         tot_score=(typeof(q1) != 'undefined' ? Number(q1) : 0)+(typeof(q2) != 'undefined' ? Number(q2) : 0)+(typeof(q3) != 'undefined' ? Number(q3) : 0)+(typeof(q4) != 'undefined' ? Number(q4) : 0)+(typeof(q5) != 'undefined' ? Number(q5) : 0)+(typeof(q6) != 'undefined' ? Number(q6) : 0)+(typeof(q7) != 'undefined' ? Number(q7) : 0)+(typeof(q8) != 'undefined' ? Number(q8) : 0)+(typeof(q9) != 'undefined' ? Number(q9) : 0);
		 
          $('#mdhl-phq_tot_score').val(tot_score).trigger('change'); 
		 }
	});	
	
	
	$('#mdhl-phq_tot_score').change(function(){		
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
	     if ($(this).val() != '') {
		 if ($(this).val()<5)
			 $('#mdhl-phq_depression_severity').val(1);
		 else if ($(this).val()<10)
			 $('#mdhl-phq_depression_severity').val(2);
		 else if ($(this).val()<15)
			 $('#mdhl-phq_depression_severity').val(3);
		 else if ($(this).val()<20)
			 $('#mdhl-phq_depression_severity').val(4);
		 else if ($(this).val()>20)
			 $('#mdhl-phq_depression_severity').val(5);
		 }
	    else
         $('#mdhl-phq_depression_severity').val('');
	});
	
	
	 $('#mdhl-mdhl_q13a,#mdhl-mdhl_q13b').change(function(){	 
		 change_q13();	
		
	 });
	 
	  $('#mdhl-mdhl_q13a,#mdhl-mdhl_q13b').focusout(function(e){
		 change_q13();	
		
	 });
	 
	  $('#mdhl-mdhl_q15a,#mdhl-mdhl_q15b').change(function(){	 
		 change_q15();	
		
	 });
	 
	  $('#mdhl-mdhl_q15a,#mdhl-mdhl_q15b').focusout(function(e){
		 change_q15();	
		
	 });
		
   
    $('#mdhl-phq_q1 input[type=radio],#mdhl-phq_q2 input[type=radio],#mdhl-phq_q3 input[type=radio],#mdhl-phq_q4 input[type=radio],#mdhl-phq_q5 input[type=radio],#mdhl-phq_q6 input[type=radio],#mdhl-phq_q7 input[type=radio],#mdhl-phq_q8 input[type=radio],#mdhl-phq_q9 input[type=radio],#mdhl-phq_tot_score,#mdhl-mdhl_q13a,#mdhl-mdhl_q13b,#mdhl-mdhl_q15a,#mdhl-mdhl_q15b').trigger('change');     
	
	";
$this->registerJs($JS);



?>

<div class="registration-form">
	<div class="panel panel-default">
		<div class="panel-heading">
			
		</div>
		<div class="panel-body">
			<div class="row">
				<div class="col-lg-12">
					<?php
						$form = ActiveForm::begin(['enableAjaxValidation' => true, 'options' => ['class' => 'form-horizontal']]);
						$template = [
							'labelOptions' => ['class' => 'form-label'],
							'template' => '<div class="col-sm-5">{label}{hint}</div><div class="col-sm-4">{input}{error}</div>',
						];
						
						$chklist_template = [
							'labelOptions' => ['class' => 'form-label'],
							'template' => '<div class="col-sm-5">{label}{hint}</div><div class="col-sm-4 checkbox-list">{input}{error}</div>',
						];
						
						$template1 = [
							'labelOptions' => ['class' => 'form-label'],
							'template' => '<div class="col-sm-5">{label}{hint}</div><div class="col-sm-7">{input}{error}</div>',
						];
						
						$htemplate = [
							'options' => ['tag' => false],
							'template' => '{input}'
						];
					?>
					
					
					<?php // echo $form->errorSummary($model); ?>		
			      <?= Common::generateControl($form, $model, $htemplate, 'mdhl_survey', $Surveys, 'survey', 'getSurveyid') ?>
						
				   <?php if($model->isNewRecord) : ?>						
						  <?= $form->field($model, 'mdhl_loc', $template)->textInput(['value' => $Locmap,'readonly' => true]) ?>
					<?php else: ?>
						   <?= $form->field($model, 'mdhl_loc', $template)->textInput(['value'=>$model->mdhl_loc,'readonly' => true]) ?>
					<?php endif; ?>	
					
					<?php if($model->isNewRecord) : ?>	
                           <?= $form->field($model, 'loc_code', $template)->dropDownList($Location,['options'=>[$Signedinloc =>['Selected'=>'selected']],'prompt' =>'Select']) ?>	
					<?php else: ?>
						   <?= $form->field($model, 'loc_code', $template)->textInput(['value'=>$model->loc_code,'readonly' => true]) ?>
					<?php endif; ?>	
					
					<?= Common::generateControl($form, $model, $template, 'mdhl_pid', $PIDs, 'pid', '', [Html::getInputId($model, 'mdhl_survey'), Html::getInputId($model, 'mdhl_loc')])?>
					
					<?php if($model->isNewRecord) : ?>		
						<?= $form->field($model, 'mdhl_date', $htemplate)->hiddenInput(['class' => 'form-control datepicker']) ?>
				    <?php else: ?>	
					   <?= $form->field($model, 'mdhl_date', $template)->textInput(['class' => 'form-control datepicker','value'=>$model->mdhl_date,'disabled' => true]) ?>
					<?php endif; ?>							
								
					<?= $form->field($model, 'mdhl_q6', $chklist_template)->checkboxList($model->med1); ?>
					<?= $form->field($model, 'mdhl_q6a', $template)->textInput(['maxlength' => true]); ?>	
					<?= $form->field($model, 'mdhl_q7', $template)->dropDownList($model->yes_no_dk, ['prompt'=>'Select']); ?>	
				    <?= $form->field($model, 'mdhl_q7a', $chklist_template)->checkboxList($model->med2); ?>
					<?= $form->field($model, 'mdhl_q8', $template)->dropDownList($model->yes_no, ['prompt'=>'Select']); ?>						
					<?= $form->field($model, 'mdhl_q8a', $template)->dropDownList($model->often1, ['prompt'=>'Select']); ?>	
					<?= $form->field($model, 'mdhl_q9', $template)->dropDownList($model->yes_no, ['prompt'=>'Select']); ?>						
					<?= $form->field($model, 'mdhl_q9a', $template)->dropDownList($model->often2, ['prompt'=>'Select']); ?>	
					<?= $form->field($model, 'mdhl_q10', $template)->dropDownList($model->serving, ['prompt'=>'Select']); ?>	
					<?= $form->field($model, 'mdhl_q11', $template)->dropDownList($model->serving, ['prompt'=>'Select']); ?>	
					<?= $form->field($model, 'mdhl_q12', $template)->dropDownList($model->days, ['prompt'=>'Select']); ?>
					
					<div class="form-group">
						  <div class="col-sm-7">
						      <?= Html::label('13. GENERAL ANXIETY DISORDER :') ?>
							  <?= Html::label('Over the last 2 weeks, how often have you been bothered by any of the following problems?') ?>
						  </div>									 
					</div> 
					
                    <?= $form->field($model, 'mdhl_q13a', $template)->dropDownList($model->yes_no, ['prompt'=>'Select']); ?>							
					<?= $form->field($model, 'mdhl_q13b', $template)->dropDownList($model->yes_no, ['prompt'=>'Select']); ?>	

         <div class="form-gad">	
			 	<div class="panel panel-default">
		        <div class="panel-heading">
				    <div class="lblcolor">
		              <?= Html::label('GAD-7 Anxiety') ?>
					</div>	

		        </div>	
                <div class="panel-body">
			       <div class="row">	
                    <div class="col-lg-12">	
										
                   <table class="table table-bordered container-items"  border="0" cellpadding="0" cellspacing="0" align="center">
						<thead>	
							<tr style ='background-color:#8B008B;color:#FFFFFF;font-weight:bold;text-align:center;'>							   
							    <td style ='width:40%'><?= Html::Label(''); ?></td>
								<td style ='width:10%'><?= Html::Label('Not at all &nbsp&nbsp&nbsp&nbsp'); ?></td>								
								<td style ='width:15%'><?= Html::Label('Several days'); ?></td>
								<td style ='width:17%'><?= Html::Label('More than half the days'); ?></td>
								<td style ='width:18%'><?= Html::Label('Nearly every day &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'); ?></td>		
							</tr>
						</thead>
						<tbody>
						</tbody>
					</table>
					
					<?= $form->field($model, 'gad_q1', $template1)->radioList($model->often,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'gad_q2', $template1)->radioList($model->often,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>			
					<?= $form->field($model, 'gad_q3', $template1)->radioList($model->often,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'gad_q4', $template1)->radioList($model->often,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>	
					<?= $form->field($model, 'gad_q5', $template1)->radioList($model->often,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'gad_q6', $template1)->radioList($model->often,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>	
					<?= $form->field($model, 'gad_q7', $template1)->radioList($model->often,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>                  
					<?= $form->field($model, 'gad_tot_score', $template)->textInput(['maxlength' => true,'readonly' => true]) ?>
		            <?= $form->field($model, 'gad_anxiety_severity', $template)->dropDownList($model->severity_gad, ['prompt' => 'Select']) ?>
				    <?= $form->field($model, 'gad_q8', $template)->dropDownList($model->q8 , ['prompt' => 'Select']) ?>								
			
					
				</div>
		      </div>
			</div> 
		</div>
</div>			
	              	<div class="form-group">
						  <div class="col-sm-7">
						      <?= Html::label('14. DEPRESSION SCALE: PATIENT HEALTH QUESTIONNAIRE (PHQ 9) :') ?>
							  <?= Html::label('Over the last 2 weeks, how often have you been bothered by any of the following problems?') ?>
						  </div>									 
					</div> 
					
                    <?= $form->field($model, 'mdhl_q15a', $template)->dropDownList($model->yes_no, ['prompt'=>'Select']); ?>							
					<?= $form->field($model, 'mdhl_q15b', $template)->dropDownList($model->yes_no, ['prompt'=>'Select']); ?>	

         <div class="form-phq">	
			 	<div class="panel panel-default">
		        <div class="panel-heading">
				    <div class="lblcolor">
		              <?= Html::label('PATIENT HEALTH QUESTIONNAIRE (PHQ 9)') ?>
					</div>	
		        </div>	
                <div class="panel-body">
			       <div class="row">	
                    <div class="col-lg-12">	
					
				  		<table class="table table-bordered container-items"  border="0" cellpadding="0" cellspacing="0" align="center">
						<thead>	
							<tr style ='background-color:#8B008B;color:#FFFFFF;font-weight:bold;text-align:center;'>							   
							    <td style ='width:40%'><?= Html::Label(''); ?></td>
								<td style ='width:10%'><?= Html::Label('Not at all &nbsp&nbsp&nbsp&nbsp'); ?></td>								
								<td style ='width:15%'><?= Html::Label('Several days'); ?></td>
								<td style ='width:17%'><?= Html::Label('More than half the days'); ?></td>
								<td style ='width:18%'><?= Html::Label('Nearly every day &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'); ?></td>		
							</tr>
						</thead>
						<tbody>
						</tbody>
					</table>
					
					<?= $form->field($model, 'phq_q1', $template1)->radioList($model->often,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'phq_q2', $template1)->radioList($model->often,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>			
					<?= $form->field($model, 'phq_q3', $template1)->radioList($model->often,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'phq_q4', $template1)->radioList($model->often,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>	
					<?= $form->field($model, 'phq_q5', $template1)->radioList($model->often,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'phq_q6', $template1)->radioList($model->often,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>	
					<?= $form->field($model, 'phq_q7', $template1)->radioList($model->often,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
                    <?= $form->field($model, 'phq_q8', $template1)->radioList($model->often,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>						
					<?= $form->field($model, 'phq_q9', $template1)->radioList($model->often,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'phq_tot_score', $template)->textInput(['maxlength' => true,'readonly' => true]) ?>
		            <?= $form->field($model, 'phq_depression_severity', $template)->dropDownList($model->severity_phq, ['prompt' => 'Select']) ?>
				    <?= $form->field($model, 'phq_q10', $template)->dropDownList($model->q10 , ['prompt' => 'Select']) ?>	
					
				</div>
		      </div>
			</div> 
		 </div>	
       </div>		 
                    <?= $form->field($model, 'mdhl_q16', $template)->dropDownList($model->yes_no_dk, ['prompt'=>'Select']); ?>							
					<?= $form->field($model, 'mdhl_q17', $template)->dropDownList($model->yes_no, ['prompt'=>'Select']); ?>							
                    <?= $form->field($model, 'mdhl_q18', $template)->dropDownList($model->yes_no_dk, ['prompt'=>'Select']); ?>							
					<?= $form->field($model, 'mdhl_q19', $template)->dropDownList($model->yes_no, ['prompt'=>'Select']); ?>	
                    <?= $form->field($model, 'mdhl_q19a', $chklist_template)->checkboxList($model->med3); ?>						
					<?= $form->field($model, 'mdhl_q19b', $template)->textInput(['maxlength' => true]); ?>
					<?= $form->field($model, 'status', $htemplate)->hiddenInput(['value' => 1])->label("") ?>
					<?= $form->field($model, $model->isNewRecord ? 'create_user' : 'update_user', $htemplate)->hiddenInput(['value' => yii::$app->user->identity->id])->label("") ?>
					<div class="form-group">
						<div class="col-sm-offset-5 col-sm-7">
						<?= Html::submitButton($model->isNewRecord ? Yii::t('app', 'Create') : Yii::t('app', 'Update'), ['class' => $model->isNewRecord ? 'btn btn-success' : 'btn btn-primary']) ?>
											 
						<?= Html::a('Cancel', ['/'.Yii::$app->controller->id], ['class' => 'btn btn-default']) ?>
						</div>
					</div>
					<?php ActiveForm::end(); ?>
				</div>
				<!-- /.col-lg-6 (nested) -->
			</div>
			<!-- /.row (nested) -->
		</div>
		<!-- /.panel-body -->
	</div>
	<!-- /.panel -->
</div>