<?php

use yii\helpers\Html;
use yii\widgets\ActiveForm;

/* @var $this yii\web\View */
/* @var $model app\models\AttandanceSearch */
/* @var $form yii\widgets\ActiveForm */
?>

<div class="attandance-search">

    <?php $form = ActiveForm::begin([
        'action' => ['index'],
        'method' => 'get',
    ]); ?>

    <?= $form->field($model, 'id') ?>

    <?= $form->field($model, 'sid') ?>

    <?= $form->field($model, 'location') ?>

    <?= $form->field($model, 'pid') ?>

    <?= $form->field($model, 'participant_id') ?>

    <?php // echo $form->field($model, 'interviewer') ?>

    <?php // echo $form->field($model, 'visit') ?>

    <?php // echo $form->field($model, 'visit_date') ?>

    <?php // echo $form->field($model, 'visit_in') ?>

    <?php // echo $form->field($model, 'out_interviewer') ?>

    <?php // echo $form->field($model, 'visit_out') ?>

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
