#!/usr/bin/env php
<?php
/* Copyright (C) 2009 Laurent Destailleur  <eldy@users.sourceforge.net>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
 /**
  *     \file       scripts/init/user-update-api-key.php
  *     \brief      Create a new Api-key on user
  *		  \author     MBA
  *		  \remarks
  */
$sapi_type = php_sapi_name();
$script_file = basename(__FILE__);
$path=dirname(__FILE__).'/';
// Test if batch mode
if (substr($sapi_type, 0, 3) == 'cgi') {
    echo "Error: You are using PHP for CGI. To execute ".$script_file." from command line, you must use PHP for CLI mode.\n";
    exit;
}
// Global variables
$version='1.0';
$error=0;
// -------------------- START OF YOUR CODE HERE --------------------
// Include Dolibarr environment
require_once $path."../../../htdocs/master.inc.php";
@set_time_limit(0);

print "***** ".$script_file." (".$version.") *****\n";
if ( count($argv) < 2)
{
  dol_print_error('','Usage: php '.$script_file. ' login' . "\n");
  exit;
}

$login = $argv[1];

// Load user and its permissions
$result = $user->fetch('', $login);	// Load user for login 'admin'. Comment line to run as anonymous user.
if (! $result > 0) { dol_print_error('',$user->error); exit; }
$user->getrights();

// Start of transaction
$db->begin();
require_once DOL_DOCUMENT_ROOT."/user/class/user.class.php";
require_once DOL_DOCUMENT_ROOT."/core/lib/security2.lib.php";

$api_key = getRandomPassword(true);

$user->api_key = $api_key;
$result = $user->update($user);
if($result > 0)
{
  print "> OK - User updated.\n";
}
else
{
  $error++;
  dol_print_error($db,$user->error);
}

// -------------------- END OF YOUR CODE --------------------

if (! $error)
{
	$db->commit();
	print '--- end ok'."\n";
}
else
{
	print '--- end error code='.$error."\n";
	$db->rollback();
}
$db->close();
return $error;
