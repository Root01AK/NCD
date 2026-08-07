<?php

use yii\helpers\Html;
use yii\widgets\ActiveForm;

/* @var $this yii\web\View */
/* @var $model app\models\ImportForm */
/* @var $form yii\widgets\ActiveForm */

$this->title = 'Import';
$this->params['breadcrumbs'][] = $this->title;
$list = [
    '{{%arvmaster}}' => 'ARV Master',
    '{{%registration}}' => 'Registration',
    '{{%hivlinkage}}' => 'HIV Linkage',
    '{{%linkidlinkage}}' => 'Linked ID Linkage',
    '{{%ostmaster}}' => 'OST Master',
    '{{%ostvisit}}' => 'OST Visit',
    '{{%counselor}}' => 'Counselor',
    '{{%hivtesting}}' => 'HIV Testing',
    '{{%hcvtesting}}' => 'HCV Testing',
    '{{%hivcounseling}}' => 'HIV Care Counseling',
    '{{%hcvlinkage}}' => 'HCV Linkage',
    '{{%nursevisit}}' => 'Nurse Visit',
    '{{%sti}}' => 'STI',
    '{{%tb}}' => 'TB',
    '{{%screening}}' => 'Screening',
    '{{%contact}}' => 'Contact',
    '{{%hivvisit}}' => 'HIV Clinical Visit',
    '{{%cd4}}' => 'CD4',
    '{{%trackingform}}' => 'Tracking Form',
    '{{%mortalityform}}' => 'Mortality Form',
    '{{%labsamplerequest}}' => 'Lab Request',
];
?>

<div class="attandance-form">
    <h1><?= Html::encode($this->title) ?></h1>
    <div class="panel panel-default">
        <div class="panel-heading">
            
        </div>
        <div class="panel-body">
            <div class="row">
                <div class="col-lg-12">
                    <?php
                        $form = ActiveForm::begin(['options' => ['class' => 'form-horizontal', 'enctype' => 'multipart/form-data']]);
                        $template = [
                            'labelOptions' => ['class' => 'form-label'],
                            'template' => '<div class="col-sm-5">{label}{hint}</div><div class="col-sm-4">{input}{error}</div>',
                        ];
                        $htemplate = [
                            'options' => ['tag' => false],
                            'template' => '{input}'
                        ];
                    ?>
                    <?= $form->field($model, 'name', $template)->dropDownList($model->list, ['prompt' => $model->getAttributeLabel("name")]) ?>
                    <div class="form-group">
                        <div class="col-sm-offset-5 col-sm-7">
                            <?= Html::submitButton(Yii::t('app', 'Export'), ['class' =>'btn btn-success']) ?>
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