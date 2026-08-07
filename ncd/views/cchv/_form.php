<?php

use yii\web\View;
use app\base\Common;
use yii\helpers\Url;
use yii\helpers\Html;
use yii\widgets\ActiveForm;

/* @var $this yii\web\View */
/* @var $model app\models\Cchv */
/* @var $form yii\widgets\ActiveForm */

$Surveys = Common::getSurvey();
$Locations = Common::getLocations();
$Locmap = Common::getLocmap();
$Location= Common::getSitelocation();
$Signedinloc=Common::getSigninLoc();
$PIDs = Common::getEnrollPIDs("cchv");

if(Yii::$app->params['SURVEY'] != '') {
	$Locations = Common::getSurlocations(Yii::$app->params['SURVEY']);
}
if(Yii::$app->params['SURVEY'] != '' && Yii::$app->params['LOCATION'] != '') {
	$Locations = Common::getSurlocations(Yii::$app->params['SURVEY']);
	//$PIDs = Common::getClientid(Yii::$app->params['SURVEY'], Yii::$app->params['LOCATION']);
}
$headJS = <<<JS

function change_secd()
	{
	  	  if($('#cchv-cchv_q54').val() != '' || $('#cchv-cchv_q56').val() != '') {	
			  
		  if(($('#cchv-cchv_q54').val() != '' && $('#cchv-cchv_q54').val() == '2') || (($('#cchv-cchv_q56-1').prop('checked') || $('#cchv-cchv_q56-2 ').prop('checked') || $('#cchv-cchv_q56-4').prop('checked')))) {
			  
			 $('.form-secd').hide();   
			 
			 $('[4] #cchv-cchv_q82 input[type=radio],#cchv-cchv_q83 input[type=radio],#cchv-cchv_q84 input[type=radio],#cchv-cchv_q85 input[type=radio],#cchv-cchv_q86 input[type=radio],#cchv-cchv_q87 input[type=radio],#cchv-cchv_q88 input[type=radio],#cchv-cchv_q89 input[type=radio],#cchv-cchv_q82 input[type=radio]').prop('checked', true);
                          			 
		  }			  
		   else {
			   $('.form-secd').show(); 
			
			}
		  }
		   else {
			 $('.form-secd').hide();  
			 $('#cchv-cchv_q82 input[type=radio],#cchv-cchv_q83 input[type=radio],#cchv-cchv_q84 input[type=radio],#cchv-cchv_q85 input[type=radio],#cchv-cchv_q86 input[type=radio],#cchv-cchv_q87 input[type=radio],#cchv-cchv_q88 input[type=radio],#cchv-cchv_q89 input[type=radio]').prop('checked', false) ;
						
		 }
	  
    }
	
JS;
$this->registerJs($headJS, View::POS_HEAD);

$JS = "
	$('.datepicker').datepicker({autoclose: true, startDate: '01-01-1900', endDate: '0', format: '".strtolower(Yii::$app->formatter->dateFormat)."'});
			
	$('#cchv-cchv_pid').on('select2:select', function (evt) {
		var pid = $(this)[0].value;		
		if(pid != '') {
			var link = $('#pid-info').data('link') + pid;			
			$.ajax({
				type: 'post',
				url: 'getpid',
				data: 'pid='+$(this)[0].value,
				success: function(response) {					
					if(response.dg_pid != null) {
						var age =response.dg_q1;						
						$('#cchv-cchv_date').val(response.dg_date);	
					if(age != '' ) {			  
					  if(age >12 &&  age <20)
						$('#cchv-cchv_q53').val(1);				
					  else if(age >20 &&  age <30)
						$('#cchv-cchv_q53').val(2);			
					  else if(age >30 && age <40)
						$('#cchv-cchv_q53').val(3);				
					  else if(age >40 && age <50)
						$('#cchv-cchv_q53').val(4);				
					  else if(age >50 && age <60)
						$('#cchv-cchv_q53').val(5);				
					  else if(age >60)
						$('#cchv-cchv_q53').val(6);	                     				
				  }						
					  $('#cchv-cchv_q54').val(response.dg_q2);	
					} else {
						$('#cchv-cchv_date').val('');	
                        $('#cchv-cchv_q53').val('');
                        $('#cchv-cchv_q54').val('');						
					}
					
				}
			});
		}
	});		
	
	$('#cchv-cchv_pid').on('select2:unselect', function (evt) {
		$('#cchv-cchv_date').val('');
        $('#cchv-cchv_q53').val('');
        $('#cchv-cchv_q54').val('');		
	});
	
		
     $('#cchv-cchv_q56-8').change(function(){
		// $('div.form-group').show();
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).prop('checked')) {
			$('div.form-group.field-cchv-cchv_q56a').addClass('required').show();
		  } 
	    else { $('div.form-group.field-cchv-cchv_q56a').removeClass('required').hide();
           $('#cchv-cchv_q56a').val('');			
		}
	});
	
	 $('#cchv-cchv_q61-7').change(function(){
		// $('div.form-group').show();
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).prop('checked')) {
			$('div.form-group.field-cchv-cchv_q61a').addClass('required').show();
		  } 
	    else { $('div.form-group.field-cchv-cchv_q61a').removeClass('required').hide();
           $('#cchv-cchv_q61a').val('');			
		}
	});
			
     $('#cchv-cchv_q99-6').change(function(){
		// $('div.form-group').show();
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).prop('checked')) {
			$('div.form-group.field-cchv-cchv_q99a').addClass('required').show();
		  } 
	    else { $('div.form-group.field-cchv-cchv_q99a').removeClass('required').hide();
           $('#cchv-cchv_q99a').val('');			
		}
	});
	
	 $('#cchv-cchv_q104-6').change(function(){
		// $('div.form-group').show();
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).prop('checked')) {
			$('div.form-group.field-cchv-cchv_q104a').addClass('required').show();
		  } 
	    else { $('div.form-group.field-cchv-cchv_q104a').removeClass('required').hide();
           $('#cchv-cchv_q104a').val('');			
		}
	});

	
	$('#cchv-cchv_q55').change(function(){
		// $('div.form-group').show();
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).val() == '5') {
			$('div.form-group.field-cchv-cchv_q55a').addClass('required').show();
		} else {
			$('div.form-group.field-cchv-cchv_q55a').removeClass('required').hide();
			
			$('#cchv-cchv_q55a').val('');
		}
	});
	
	
	$('#cchv-cchv_q58').change(function(){
		// $('div.form-group').show();
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).val() == '7') {
			$('div.form-group.field-cchv-cchv_q58a').addClass('required').show();
		} else {
			$('div.form-group.field-cchv-cchv_q58a').removeClass('required').hide();
			
			$('#cchv-cchv_q58a').val('');
		}
	});
	
	$('#cchv-cchv_q101').change(function(){
		// $('div.form-group').show();
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).val() == '1') {
			$('div.form-group.field-cchv-cchv_q101a').addClass('required').show();
		} else {
			$('div.form-group.field-cchv-cchv_q101a').removeClass('required').hide();
			
			$('#cchv-cchv_q101a').val('');
		}
	});
	
	 $('#cchv-cchv_q54,#cchv-cchv_q56-1,#cchv-cchv_q56-2,#cchv-cchv_q56-4').change(function(){	 
		 change_secd();	
		
	 });
	 
	  $('#cchv-cchv_q54,#cchv-cchv_q56-1,#cchv-cchv_q56-2,#cchv-cchv_q56-4').focusout(function(e){
		 change_secd();	
		
	 });
	 
	 $('#cchv-cchv_q56-9').change(function(){
		// $('div.form-group').show();
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).prop('checked')) {		   $('#cchv-cchv_q56-1,#cchv-cchv_q56-2,#cchv-cchv_q56-3,#cchv-cchv_q56-4,#cchv-cchv_q56-5,#cchv-cchv_q56-6,#cchv-cchv_q56-7,#cchv-cchv_q56-8').prop('checked', false).prop('disabled', true);  
           $('div.form-group.field-cchv-cchv_q56a').removeClass('required').hide();
           $('#cchv-cchv_q56a').val('');	
		  } 
	    else  
		   $('#cchv-cchv_q56-1,#cchv-cchv_q56-2,#cchv-cchv_q56-3,#cchv-cchv_q56-4,#cchv-cchv_q56-5,#cchv-cchv_q56-6,#cchv-cchv_q56-7,#cchv-cchv_q56-8').prop('disabled', false);  
       
	});
	
	$('#cchv-cchv_q56-1,#cchv-cchv_q56-2,#cchv-cchv_q56-3,#cchv-cchv_q56-4,#cchv-cchv_q56-5,#cchv-cchv_q56-6,#cchv-cchv_q56-7,#cchv-cchv_q56-8').change(function(){
		// $('div.form-group').show();
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($('#cchv-cchv_q56-1').prop('checked') ||$('#cchv-cchv_q56-2').prop('checked') || $('#cchv-cchv_q56-3').prop('checked')|| $('#cchv-cchv_q56-4').prop('checked')|| $('#cchv-cchv_q56-5').prop('checked')|| $('#cchv-cchv_q56-6').prop('checked')|| $('#cchv-cchv_q56-7').prop('checked') || $('#cchv-cchv_q56-8').prop('checked') ) 
		   $('#cchv-cchv_q56-9').prop('checked', false).prop('disabled', true); 
	    else  
		   $('#cchv-cchv_q56-9').prop('disabled', false);  
       
	});
	
	$('#cchv-cchv_q61-8').change(function(){
		// $('div.form-group').show();
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).prop('checked')) {		   $('#cchv-cchv_q61-1,#cchv-cchv_q61-2,#cchv-cchv_q61-3,#cchv-cchv_q61-4,#cchv-cchv_q61-5,#cchv-cchv_q61-6,#cchv-cchv_q61-7').prop('checked', false).prop('disabled', true);  
           $('div.form-group.field-cchv-cchv_q61a').removeClass('required').hide();
           $('#cchv-cchv_q61a').val('');	
		  } 
	    else  
		   $('#cchv-cchv_q61-1,#cchv-cchv_q61-2,#cchv-cchv_q61-3,#cchv-cchv_q61-4,#cchv-cchv_q61-5,#cchv-cchv_q61-6,#cchv-cchv_q61-7').prop('disabled', false);  
       
	});
	
	$('#cchv-cchv_q61-1,#cchv-cchv_q61-2,#cchv-cchv_q61-3,#cchv-cchv_q61-4,#cchv-cchv_q61-5,#cchv-cchv_q61-6,#cchv-cchv_q61-7').change(function(){
		// $('div.form-group').show();
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($('#cchv-cchv_q61-1').prop('checked') ||$('#cchv-cchv_q61-2').prop('checked') || $('#cchv-cchv_q61-3').prop('checked')|| $('#cchv-cchv_q61-4').prop('checked')|| $('#cchv-cchv_q61-5').prop('checked')|| $('#cchv-cchv_q61-6').prop('checked')|| $('#cchv-cchv_q61-7').prop('checked')) 
		   $('#cchv-cchv_q61-8').prop('checked', false).prop('disabled', true); 
	    else  
		   $('#cchv-cchv_q61-8').prop('disabled', false);  
       
	});
	
	$('#cchv-cchv_q99-7').change(function(){
		// $('div.form-group').show();
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).prop('checked')) {		   $('#cchv-cchv_q99-1,#cchv-cchv_q99-2,#cchv-cchv_q99-3,#cchv-cchv_q99-4,#cchv-cchv_q99-5,#cchv-cchv_q99-6').prop('checked', false).prop('disabled', true);  
           $('div.form-group.field-cchv-cchv_q99a').removeClass('required').hide();
           $('#cchv-cchv_q99a').val('');	
		  } 
	    else  
		   $('#cchv-cchv_q99-1,#cchv-cchv_q99-2,#cchv-cchv_q99-3,#cchv-cchv_q99-4,#cchv-cchv_q99-5,#cchv-cchv_q99-6').prop('disabled', false);  
       
	});
	
	$('#cchv-cchv_q99-1,#cchv-cchv_q99-2,#cchv-cchv_q99-3,#cchv-cchv_q99-4,#cchv-cchv_q99-5,#cchv-cchv_q99-6').change(function(){
		// $('div.form-group').show();
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($('#cchv-cchv_q99-1').prop('checked') ||$('#cchv-cchv_q99-2').prop('checked') || $('#cchv-cchv_q99-3').prop('checked')|| $('#cchv-cchv_q99-4').prop('checked')|| $('#cchv-cchv_q99-5').prop('checked')|| $('#cchv-cchv_q99-6').prop('checked')) 
		   $('#cchv-cchv_q99-7').prop('checked', false).prop('disabled', true); 
	    else  
		   $('#cchv-cchv_q99-7').prop('disabled', false);  
       
	});
	
	$('#cchv-cchv_q104-7').change(function(){
		// $('div.form-group').show();
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).prop('checked')) {		   $('#cchv-cchv_q104-1,#cchv-cchv_q104-2,#cchv-cchv_q104-3,#cchv-cchv_q104-4,#cchv-cchv_q104-5,#cchv-cchv_q104-6').prop('checked', false).prop('disabled', true);  
           $('div.form-group.field-cchv-cchv_q104a').removeClass('required').hide();
           $('#cchv-cchv_q104a').val('');	
		  } 
	    else  
		   $('#cchv-cchv_q104-1,#cchv-cchv_q104-2,#cchv-cchv_q104-3,#cchv-cchv_q104-4,#cchv-cchv_q104-5,#cchv-cchv_q104-6').prop('disabled', false);  
       
	});
	
	$('#cchv-cchv_q104-1,#cchv-cchv_q104-2,#cchv-cchv_q104-3,#cchv-cchv_q104-4,#cchv-cchv_q104-5,#cchv-cchv_q104-6').change(function(){
		// $('div.form-group').show();
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($('#cchv-cchv_q104-1').prop('checked') ||$('#cchv-cchv_q104-2').prop('checked') || $('#cchv-cchv_q104-3').prop('checked')|| $('#cchv-cchv_q104-4').prop('checked')|| $('#cchv-cchv_q104-5').prop('checked')|| $('#cchv-cchv_q104-6').prop('checked')) 
		   $('#cchv-cchv_q104-7').prop('checked', false).prop('disabled', true); 
	    else  
		   $('#cchv-cchv_q104-7').prop('disabled', false);  
       
	});
					
		 
	$('#cchv-cchv_q56 input[type=checkbox], #cchv-cchv_q61 input[type=checkbox],#cchv-cchv_q55,#cchv-cchv_q58,#cchv-cchv_q101,#cchv-cchv_q99 input[type=checkbox],#cchv-cchv_q104 input[type=checkbox],#cchv-cchv_q54').trigger('change');
	
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
			      <?= Common::generateControl($form, $model, $htemplate, 'cchv_survey', $Surveys, 'survey', 'getSurveyid') ?>
						
				   <?php if($model->isNewRecord) : ?>						
						  <?= $form->field($model, 'cchv_loc', $template)->textInput(['value' => $Locmap,'readonly' => true]) ?>
					<?php else: ?>
						   <?= $form->field($model, 'cchv_loc', $template)->textInput(['value'=>$model->cchv_loc,'readonly' => true]) ?>
					<?php endif; ?>	
					
					<?php if($model->isNewRecord) : ?>	
                           <?= $form->field($model, 'loc_code', $template)->dropDownList($Location,['options'=>[$Signedinloc =>['Selected'=>'selected']],'prompt' =>'Select']) ?>	
					<?php else: ?>
						   <?= $form->field($model, 'loc_code', $template)->textInput(['value'=>$model->loc_code,'readonly' => true]) ?>
					<?php endif; ?>	
					
					<?= Common::generateControl($form, $model, $template, 'cchv_pid', $PIDs, 'pid', '', [Html::getInputId($model, 'cchv_survey'), Html::getInputId($model, 'cchv_loc')])?>
					
					<?php if($model->isNewRecord) : ?>		
						<?= $form->field($model, 'cchv_date', $htemplate)->hiddenInput(['class' => 'form-control datepicker']) ?>
				    <?php else: ?>	
					   <?= $form->field($model, 'cchv_date', $template)->textInput(['class' => 'form-control datepicker','value'=>$model->cchv_date,'disabled' => true]) ?>
					<?php endif; ?>	
                      
                    <div class="lblcolor">
		              <?= Html::label('SECTION A. Participant Information & Demographics') ?>
					</div>						  

					<?= $form->field($model, 'cchv_q53', $template)->dropDownList($model->q53, ['prompt'=>'Select']); ?>
					<?= $form->field($model, 'cchv_q54', $template)->dropDownList($model->q54, ['prompt'=>'Select']); ?>
					<?= $form->field($model, 'cchv_q55', $template)->dropDownList($model->q55, ['prompt'=>'Select']); ?>	
					<?= $form->field($model, 'cchv_q55a', $template)->textInput(['maxlength' => true]); ?>		
					<?= $form->field($model, 'cchv_q56', $chklist_template)->checkboxList($model->q56); ?>
					<?= $form->field($model, 'cchv_q56a', $template)->textInput(['maxlength' => true]); ?>	
					
                    <?= $form->field($model, 'cchv_q57', $template)->dropDownList($model->q57, ['prompt'=>'Select']); ?>
		            <?= $form->field($model, 'cchv_q58', $template)->dropDownList($model->q58, ['prompt'=>'Select']); ?>	
					<?= $form->field($model, 'cchv_q58a', $template)->textInput(['maxlength' => true]); ?>
					<?= $form->field($model, 'cchv_q59', $template)->dropDownList($model->q59, ['prompt'=>'Select']); ?>
					<?= $form->field($model, 'cchv_q60', $template)->dropDownList($model->q60, ['prompt'=>'Select']); ?>
					<?= $form->field($model, 'cchv_q61', $chklist_template)->checkboxList($model->q61); ?>
					<?= $form->field($model, 'cchv_q61a', $template)->textInput(['maxlength' => true]); ?>
					
					<div class="lblcolor">
		              <?= Html::label('SECTION B. Climate Change Exposure & Perceptions') ?>
					</div>	
				
				    <table class="table table-bordered container-items"  border="0" cellpadding="0" cellspacing="0" align="center">
						<thead>	
							<tr style ='background-color:#8B008B;color:#FFFFFF;font-weight:bold;text-align:center;'>							   
							    <td style ='width:40%'><?= Html::Label(''); ?></td>
								<td style ='width:10%'><?= Html::Label('True &nbsp&nbsp&nbsp&nbsp'); ?></td>								
								<td style ='width:15%'><?= Html::Label('False'); ?></td>
								<td style ='width:17%'><?= Html::Label('Don’t know'); ?></td>
								<td style ='width:18%'><?= Html::Label('Refuse to answer &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'); ?></td>		
							</tr>
						</thead>
						<tbody>
						</tbody>
					</table>
					
					<?= $form->field($model, 'cchv_q62', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q63', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q64', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>	
					<?= $form->field($model, 'cchv_q65', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q66', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>	
					<?= $form->field($model, 'cchv_q67', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
                    <?= $form->field($model, 'cchv_q68', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>						
					<?= $form->field($model, 'cchv_q69', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q70', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q71', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q72', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q73', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					
					<div class="lblcolor">
		              <?= Html::label('SECTION C. Infectious Diseases') ?>
					</div>	
					
					<table class="table table-bordered container-items"  border="0" cellpadding="0" cellspacing="0" align="center">
						<thead>	
							<tr style ='background-color:#8B008B;color:#FFFFFF;font-weight:bold;text-align:center;'>							   
							    <td style ='width:40%'><?= Html::Label(''); ?></td>
								<td style ='width:10%'><?= Html::Label('True &nbsp&nbsp&nbsp&nbsp'); ?></td>								
								<td style ='width:15%'><?= Html::Label('False'); ?></td>
								<td style ='width:17%'><?= Html::Label('Don’t know'); ?></td>
								<td style ='width:18%'><?= Html::Label('Refuse to answer &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'); ?></td>		
							</tr>
						</thead>
						<tbody>
						</tbody>
					</table>
					
					<?= $form->field($model, 'cchv_q74', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q75', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q76', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>	
					<?= $form->field($model, 'cchv_q77', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q78', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>	
					<?= $form->field($model, 'cchv_q79', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
                    <?= $form->field($model, 'cchv_q80', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>						
					<?= $form->field($model, 'cchv_q81', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					
			 <div class="form-secd">	
					<div class="lblcolor">
		              <?= Html::label('SECTION D. Sexual & Reproductive Health (SRH)') ?>
					</div>	
					
					<table class="table table-bordered container-items"  border="0" cellpadding="0" cellspacing="0" align="center">
						<thead>	
							<tr style ='background-color:#8B008B;color:#FFFFFF;font-weight:bold;text-align:center;'>							   
							    <td style ='width:40%'><?= Html::Label(''); ?></td>
								<td style ='width:10%'><?= Html::Label('True &nbsp&nbsp&nbsp&nbsp'); ?></td>								
								<td style ='width:15%'><?= Html::Label('False'); ?></td>
								<td style ='width:17%'><?= Html::Label('Don’t know'); ?></td>
								<td style ='width:18%'><?= Html::Label('Refuse to answer &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'); ?></td>		
							</tr>
						</thead>
						<tbody>
						</tbody>
					</table>
					
					<?= $form->field($model, 'cchv_q82', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q83', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q84', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q85', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>					
					<?= $form->field($model, 'cchv_q86', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>						
					<?= $form->field($model, 'cchv_q87', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q88', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q89', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
			</div>
					
					<div class="lblcolor">
		              <?= Html::label('SECTION E. Healthcare Access, Continuity, and Quality') ?>
					</div>
					
					<table class="table table-bordered container-items"  border="0" cellpadding="0" cellspacing="0" align="center">
						<thead>	
							<tr style ='background-color:#8B008B;color:#FFFFFF;font-weight:bold;text-align:center;'>							   
							    <td style ='width:40%'><?= Html::Label(''); ?></td>
								<td style ='width:10%'><?= Html::Label('True &nbsp&nbsp&nbsp&nbsp'); ?></td>								
								<td style ='width:15%'><?= Html::Label('False'); ?></td>
								<td style ='width:17%'><?= Html::Label('Don’t know'); ?></td>
								<td style ='width:18%'><?= Html::Label('Refuse to answer &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'); ?></td>		
							</tr>
						</thead>
						<tbody>
						</tbody>
					</table>
					
					
					<?= $form->field($model, 'cchv_q90', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q91', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q92', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q93', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q94', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q95', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q96', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q97', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					
					<div class="lblcolor">
		              <?= Html::label('SECTION F. Antibiotic Use, Misuse, and Antimicrobial resistance (AMR) Risk') ?>
					</div>
					
					<?= $form->field($model, 'cchv_q98', $template)->dropDownList($model->yes_no_dk_rf, ['prompt'=>'Select']); ?>
					<?= $form->field($model, 'cchv_q99', $chklist_template)->checkboxList($model->q99); ?>
					<?= $form->field($model, 'cchv_q99a', $template)->textInput(['maxlength' => true]); ?>
					<?= $form->field($model, 'cchv_q100', $template)->dropDownList($model->q100, ['prompt'=>'Select']); ?>
					<?= $form->field($model, 'cchv_q101', $template)->dropDownList($model->yes_no_dk, ['prompt'=>'Select']); ?>	
					<?= $form->field($model, 'cchv_q101a', $template)->textInput(['maxlength' => true]); ?>
					<?= $form->field($model, 'cchv_q102', $template)->dropDownList($model->q102, ['prompt'=>'Select']); ?>
					<?= $form->field($model, 'cchv_q103', $template)->dropDownList($model->yes_no_na, ['prompt'=>'Select']); ?>	
					<?= $form->field($model, 'cchv_q104', $chklist_template)->checkboxList($model->q104); ?>
					<?= $form->field($model, 'cchv_q104a', $template)->textInput(['maxlength' => true]); ?>
					<?= $form->field($model, 'cchv_q105', $template)->dropDownList($model->yes_no_dk_rf, ['prompt'=>'Select']); ?>
					<?= $form->field($model, 'cchv_q106', $template)->dropDownList($model->yes_no_dk_rf, ['prompt'=>'Select']); ?>
					<?= $form->field($model, 'cchv_q107', $template)->dropDownList($model->yes_no_dk_rf, ['prompt'=>'Select']); ?>
					<?= $form->field($model, 'cchv_q108', $template)->dropDownList($model->yes_no_dk_rf, ['prompt'=>'Select']); ?>					
					
					<div class="lblcolor">
		              <?= Html::label('SECTION G. Vulnerability & Social Determinants') ?>
					</div>
					
					<table class="table table-bordered container-items"  border="0" cellpadding="0" cellspacing="0" align="center">
						<thead>	
							<tr style ='background-color:#8B008B;color:#FFFFFF;font-weight:bold;text-align:center;'>							   
							    <td style ='width:40%'><?= Html::Label(''); ?></td>
								<td style ='width:10%'><?= Html::Label('True &nbsp&nbsp&nbsp&nbsp'); ?></td>								
								<td style ='width:15%'><?= Html::Label('False'); ?></td>
								<td style ='width:17%'><?= Html::Label('Don’t know'); ?></td>
								<td style ='width:18%'><?= Html::Label('Refuse to answer &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'); ?></td>		
							</tr>
						</thead>
						<tbody>
						</tbody>
					</table>
					
					
					<?= $form->field($model, 'cchv_q109', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q110', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q111', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q112', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q113', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q114', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					
					<div class="lblcolor">
		              <?= Html::label('SECTION H. Community, Adaptation & Resilience') ?>
					</div>
					
					<table class="table table-bordered container-items"  border="0" cellpadding="0" cellspacing="0" align="center">
						<thead>	
							<tr style ='background-color:#8B008B;color:#FFFFFF;font-weight:bold;text-align:center;'>							   
							    <td style ='width:40%'><?= Html::Label(''); ?></td>
								<td style ='width:10%'><?= Html::Label('True &nbsp&nbsp&nbsp&nbsp'); ?></td>								
								<td style ='width:15%'><?= Html::Label('False'); ?></td>
								<td style ='width:17%'><?= Html::Label('Don’t know'); ?></td>
								<td style ='width:18%'><?= Html::Label('Refuse to answer &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'); ?></td>		
							</tr>
						</thead>
						<tbody>
						</tbody>
					</table>
					
					<?= $form->field($model, 'cchv_q115', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q116', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>						
					<?= $form->field($model, 'cchv_q117', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					<?= $form->field($model, 'cchv_q118', $template1)->radioList($model->tf,['separator'=>'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'])?>
					
					<div class="lblcolor">
		              <?= Html::label('SECTION I. Open-Ended Questions') ?>
					</div>
					
					<?= $form->field($model, 'cchv_q119', $template)->textarea(['maxlength' => true,'rows' => '2']); ?>
					<?= $form->field($model, 'cchv_q120', $template)->textarea(['maxlength' => true,'rows' => '2']); ?>
					<?= $form->field($model, 'cchv_q121', $template)->textarea(['maxlength' => true,'rows' => '2']); ?>
					<?= $form->field($model, 'cchv_q122', $template)->textarea(['maxlength' => true,'rows' => '2']); ?>
     	 
                  
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