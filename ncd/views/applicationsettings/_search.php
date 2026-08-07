<?php

use yii\helpers\Html;
use yii\widgets\ActiveForm;

/* @var $this yii\web\View */
/* @var $model app\models\ApplicationsettingsSearch */
/* @var $form yii\widgets\ActiveForm */
?>

<div class="applicationsettings-search">

    <?php $form = ActiveForm::begin([
        'action' => ['index'],
        'method' => 'get',
    ]); ?>

    <?= $form->field($model, 'app_stngs_id') ?>

    <?= $form->field($model, 'app_survey_id') ?>

    <?= $form->field($model, 'app_coupons') ?>

    <?= $form->field($model, 'app_incentive') ?>

    <?= $form->field($model, 'app_fin_yr') ?>

    <?php // echo $form->field($model, 'app_fin_yr_fixed') ?>

    <?php // echo $form->field($model, 'app_reimbsmnt_vchr') ?>

    <?php // echo $form->field($model, 'app_reimbsmnt_vchr_fixed') ?>

    <?php // echo $form->field($model, 'app_location') ?>

    <?php // echo $form->field($model, 'app_location_fixed') ?>

    <?php // echo $form->field($model, 'app_cupn_cde_fixed') ?>

    <?php // echo $form->field($model, 'app_no_of_coupon') ?>

    <?php // echo $form->field($model, 'app_no_of_coupon_fixed') ?>

    <?php // echo $form->field($model, 'app_cupn_prd') ?>

    <?php // echo $form->field($model, 'app_cupn_prd_type') ?>

    <?php // echo $form->field($model, 'app_cupn_prd_fixed') ?>

    <?php // echo $form->field($model, 'app_incentive_amt') ?>

    <?php // echo $form->field($model, 'app_incentive_amt_fixed') ?>

    <?php // echo $form->field($model, 'app_incentive_vchr') ?>

    <?php // echo $form->field($model, 'app_incentive_vchr_fixed') ?>

    <?php // echo $form->field($model, 'status') ?>

    <?php // echo $form->field($model, 'create_time') ?>

    <?php // echo $form->field($model, 'create_user') ?>

    <?php // echo $form->field($model, 'update_time') ?>

    <?php // echo $form->field($model, 'update_user') ?>

    <div class="form-group">
        <?= Html::submitButton(Yii::t('app', 'Search'), ['class' => 'btn btn-primary']) ?>
        <?= Html::resetButton(Yii::t('app', 'Reset'), ['class' => 'btn btn-default']) ?>
    </div>

    <?php ActiveForm::end(); ?>

</div>
