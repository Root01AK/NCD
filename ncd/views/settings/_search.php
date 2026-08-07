<?php

use yii\helpers\Html;
use yii\widgets\ActiveForm;

/* @var $this yii\web\View */
/* @var $model app\models\SettingsSearch */
/* @var $form yii\widgets\ActiveForm */
?>

<div class="settings-search">

    <?php $form = ActiveForm::begin([
        'action' => ['index'],
        'method' => 'get',
    ]); ?>

    <?= $form->field($model, 'stngs_id') ?>

    <?= $form->field($model, 'stngs_app_name') ?>

    <?= $form->field($model, 'stngs_org_logo') ?>

    <?= $form->field($model, 'stngs_org_name') ?>

    <?= $form->field($model, 'stngs_org_addrs') ?>

    <?php // echo $form->field($model, 'stngs_org_phone') ?>

    <?php // echo $form->field($model, 'stngs_org_mail') ?>

    <?php // echo $form->field($model, 'stngs_org_website') ?>

    <?php // echo $form->field($model, 'smtp_admin_name') ?>

    <?php // echo $form->field($model, 'smtp_frm_mail') ?>

    <?php // echo $form->field($model, 'smtp_server_name') ?>

    <?php // echo $form->field($model, 'smtp_server_port') ?>

    <?php // echo $form->field($model, 'smtp_server_usrname') ?>

    <?php // echo $form->field($model, 'smtp_server_pwd') ?>

    <?php // echo $form->field($model, 'smtp_server_ssl') ?>

    <?php // echo $form->field($model, 'smtp_server_auth') ?>

    <?php // echo $form->field($model, 'stngs_timezone') ?>

    <?php // echo $form->field($model, 'stngs_dateformat') ?>

    <?php // echo $form->field($model, 'stngs_pagesize') ?>

    <?php // echo $form->field($model, 'stngs_incendv_amt') ?>

    <?php // echo $form->field($model, 'stngs_financial_year') ?>

    <?php // echo $form->field($model, 'stngs_location') ?>

    <?php // echo $form->field($model, 'stngs_survey_code') ?>

    <?php // echo $form->field($model, 'stngs_survey_fixed') ?>

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
