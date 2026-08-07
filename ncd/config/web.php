<?php

use kartik\grid\GridView;

$params = require(__DIR__ . '/params.php');

$config = [
    'id' => 'basic',
    'name' => 'ICC+',
    'basePath' => dirname(__DIR__),
    'bootstrap' => ['log'],
	'timeZone' => 'Asia/Calcutta',
    'modules' => [
       'gridview' =>  [
            'class' => '\kartik\grid\Module'
        ],
        'api' => [
            'class' => 'app\modules\api\Module',
        ],
    ],
    'components' => [
        'jwt' => [
            'class' => \bizley\jwt\Jwt::class,
            'signer' => \bizley\jwt\Jwt::HS256,
            'signingKey' => 'super-secret-icc-plus-key-2026-secure', // Secret key for JWT (must be >= 32 chars)
            'validationConstraints' => function ($jwt) {
                $config = $jwt->getConfiguration();
                return [
                    new \Lcobucci\JWT\Validation\Constraint\SignedWith($config->signer(), $config->signingKey())
                ];
            },
        ],
        'view' => [
			 'theme' => [
				 'pathMap' => [
					'@app/views' => '@vendor/dmstr/yii2-adminlte-asset/example-views/yiisoft/yii2-app'
				 ],
			 ],
		],
		'assetManager' => [		    
			'bundles' => [
				'dmstr\web\AdminLteAsset' => [
					//'skin' => 'skin-yellow-light',
					// 'skin' => 'skin-yellow',
					// 'skin' => '_all-skins',
					'skin' => 'skin-purple-light',
				],
			],
		],
        'request' => [
            // !!! insert a secret key in the following (if it is empty) - this is required by cookie validation
            'cookieValidationKey' => '-fFSpa6Nd970D66BqSKt019k4ntJ_RoX',
            'parsers' => [
                'application/json' => 'yii\web\JsonParser',
            ],
        ],
        'cache' => [
            'class' => 'yii\caching\FileCache',
        ],
        'user' => [
            'identityClass' => 'app\models\User',
            'enableAutoLogin' => true,
        ],
        'errorHandler' => [
            'errorAction' => 'site/error',
        ],
        'mailer' => [
            'class' => 'yii\swiftmailer\Mailer',
            // send all mails to a file by default. You have to set
            // 'useFileTransport' to false and configure a transport
            // for the mailer to send real emails.
            'useFileTransport' => true,
        ],
        'log' => [
            'traceLevel' => YII_DEBUG ? 3 : 0,
            'targets' => [
                // [
                    // 'class' => 'yii\log\DbTarget',
                    // 'levels' => ['info', 'trace', 'error', 'warning'],
                // ],
                [
                    'class' => 'yii\log\FileTarget',
                    'levels' => ['error', 'warning'],
                ],
            ],
        ],
        'db' => require(__DIR__ . '/db.php'),
        'urlManager' => [
            'enablePrettyUrl' => true,
            'showScriptName' => false,
            'rules' => [
                'api/v1/auth/login' => 'api/auth/login',
                'api/v1/dashboard/<action>' => 'api/dashboard/<action>',
                'api/v1/fieldmaster/<action>' => 'api/fieldmaster/<action>',
                'api/v1/surveymaster/update/<id:\d+>' => 'api/surveymaster/update',
                'api/v1/surveymaster/<action>' => 'api/surveymaster/<action>',
                'api/v1/screening/<action>' => 'api/screening/<action>',
                'api/v1/location/<action>' => 'api/location/<action>',
                'api/v1/users/<action>' => 'api/users/<action>',
            ],
        ],
		'formatter' => [
            'timeZone' => 'Asia/Kolkata',
            'timeFormat' => 'HH:mm:ss',
            'dateFormat' => 'dd-MM-yyyy',
            'datetimeFormat' => 'dd-MM-yyyy HH:mm:ss',
            'decimalSeparator' => '.',
            'thousandSeparator' => ',',
            'currencyCode' => 'INR',
		],
    ],
    'params' => $params,
];

if (YII_ENV_DEV) {
    // configuration adjustments for 'dev' environment
    $config['bootstrap'][] = 'debug';
    $config['modules']['debug'] = [
        'class' => 'yii\debug\Module',
    ];

    $config['bootstrap'][] = 'gii';
    $config['modules']['gii'] = [
        'class' => 'yii\gii\Module',
		'generators' => [
			'crud'   => [
				// 'class'     => 'yii\gii\generators\crud\Generator',
				'class'     => 'app\templates\mycrud\Generator',
				'templates' => ['mycrud' => '@app/templates/mycrud/default']
			],
			'model'   => [
				// 'class'     => 'yii\gii\generators\model\Generator',
				'class'     => 'app\templates\mymodel\Generator',
				'templates' => ['mycrud' => '@app/templates/mymodel/default']
			],
		]
    ];
}

\Yii::$container->set('kartik\grid\GridView', [
    // 'layout' => "{summary}\n{pager}\n{items}\n{pager}",
    'panelHeadingTemplate' => '
    <div class="pull-right">
        {summary}
    </div>
    <h3 class="panel-title">
        {heading}
    </h3>
    <div class="clearfix"></div>',
    'panelBeforeTemplate' => '
    <div class="kv-panel-pager">
	    {toolbar}
        {pager}
    </div>
    <div class="clearfix"></div>
    {before}
    <div class="clearfix"></div>
    ',
    'panelAfterTemplate' => '
    <div class="kv-panel-pager">
        {pager}
    </div>
    <div class="clearfix"></div>
    {after}
    <div class="clearfix"></div>
    ',
    'panelFooterTemplate' => '
    {footer}
    <div class="clearfix"></div>
    ',
    'resizableColumns'=>false,
    // 'responsive'=>true,
    // 'condensed' => true,
    'hover'=>true,
    'pjax'=>true,
    'pjaxSettings'=>[
        'neverTimeout'=>true,
        'options' => ['enablePushState' => false]
    ],
    'floatHeader'=>false,
    'showPageSummary'=>false,
    // 'floatOverflowContainer'=>true,
    // 'floatHeaderOptions'=>['scrollingTop'=>'30'],
    'panel' => [
        'type'=>'default',
        'footer'=>false
    ],
    'exportConfig' => [
        GridView::CSV => [],
        GridView::EXCEL => [
            'options' => ['title' => Yii::t('kvgrid', 'Microsoft Excel')]
        ],
        // GridView::PDF => [],
    ],
    'pager' => [
        'options' => ['class' => 'pagination pull-right'],
        'prevPageLabel' => '<',
        'firstPageLabel' => '<<',
        'lastPageLabel' => '>>',
        'nextPageLabel' => '>',
    ],
]);

\Yii::$container->set('yii\grid\GridView', [
    'layout' => '<div class="box"><div class="box-header with-border">{summary}<br/><div class="clearfix">{pager}</div></div><div class="box-body">{items}</div><div class="box-footer clearfix">{pager}</div></div>',
    'summaryOptions' => ['class' => 'summary pull-right'],
    // 'tableOptions' => ['class' => 'table table-striped table-bordered table-hover'],
    'tableOptions' => ['class' => 'table table-striped table-bordered'],
    'pager' => [
        'options' => ['class' => 'pagination pull-right'],
        'prevPageLabel' => '<',
        'firstPageLabel' => '<<',
        'lastPageLabel' => '>>',
        'nextPageLabel' => '>',
    ],
]);

\Yii::$container->set('yii\widgets\DetailView', [
    // 'template' => '<div class="box"><div class="box-header with-border">{summary}</div><div class="box-body">{items}</div><div class="box-footer clearfix">{pager}</div></div>',
    // 'summaryOptions' => ['class' => 'summary pull-right'],
    'options' => ['class' => 'table table-striped table-bordered detail-view box'],
]);

\Yii::$container->set('miserenkov\TimeZonePicker', [
    'groupTimezones' => false,
    'template' => '{name} ({offset})'
]);

\Yii::$container->set('yii\widgets\LinkPager', [
    // 'maxButtonCount' => 5
    // 'options' => ['class' => 'pagination pull-right']
]);

\Yii::$container->set('kartik\select2\Select2', [
    'pluginOptions' => ['allowClear' => true],
    'theme' => kartik\select2\Select2::THEME_DEFAULT,
]);

\Yii::$container->set('kartik\widgets\DatePicker', [
    'pluginOptions' => ['autoclose' => true, 'startDate' => '01-01-1900', 'endDate' => '0', 'format' => strtolower($config["components"]["formatter"]["dateFormat"])],
    'type' => kartik\widgets\DatePicker::TYPE_INPUT,
]);

return $config;
