<?php
declare(strict_types=1);
require __DIR__ . '/porter-bootstrap.php';
// Retire the duplicate JSON/unauthenticated mail path from SIA v1.
porter_fail(410, 'ENDPOINT_RETIRED', 'Please use SIA’s enquiry form or Prism’s Contact page.');
