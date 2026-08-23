import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button } from "react-bootstrap";
import {
  FaClock,
  FaSignInAlt,
  FaSignOutAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";
import "./PunchControls.scss";

const PunchControls = () => {
  const [seconds, setSeconds] = useState(0);
  const [isPunchedIn, setIsPunchedIn] = useState(false);

  // Timer
  useEffect(() => {
    let timer;

    if (isPunchedIn) {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isPunchedIn]);

  const formatTime = () => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  // Punch In
  const handlePunchIn = () => {
    setIsPunchedIn(true);
  };

  // Punch Out
  const handlePunchOut = () => {
    setIsPunchedIn(false);
  };

  // Same button handler
  const handlePunch = () => {
    if (isPunchedIn) {
      handlePunchOut();
    } else {
      handlePunchIn();
    }
  };

  return (
    <Card className="punch-card border-0">
      <Card.Body className="punch-card-body">

        {/* Header */}
        <div className="punch-header d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <FaClock className="punch-clock-icon" />

            <h4 className="punch-title mb-0">
              Punch Controls
            </h4>
          </div>

          <div className="office-hours">
            Office Hours: 09:00 – 18:00
          </div>
        </div>

        <hr className="punch-divider" />

        {/* Current Status */}
        <div className="status-section">
          <div className="status-indicator"></div>

          <div>
            <h5 className="status-title">
              Current Status:
            </h5>

            <span className="status-badge">
              <span className="status-dot"></span>
              {isPunchedIn ? "PRESENT" : "NOT PUNCHED"}
            </span>
          </div>
        </div>

        {/* Timer + Button */}
        <Row className="timer-section align-items-center">

          <Col lg={6} md={6} sm={12} >
            <div className="timer">
              {formatTime()}
            </div>
          </Col>

          <Col lg={6} md={6} sm={12} className="punch-wrapper">
            <div className="punch-buttons">

              {/* Same button */}
              <Button
                className={`punch-btn ${isPunchedIn
                    ? "punch-out-btn"
                    : "punch-in-btn"
                  }`}
                onClick={handlePunch}
              >
                {isPunchedIn ? (
                  <>
                    <FaSignOutAlt />
                    <span>Punch Out</span>
                  </>
                ) : (
                  <>
                    <FaSignInAlt />
                    <span>Punch In</span>
                  </>
                )}
              </Button>

            </div>
          </Col>

        </Row>


        <div className="work-location-wrapper row mt-4">
          <div className="location-section col-lg-6">
            <span className="location-icon" >
              <FaMapMarkerAlt />
            </span>
            <span>
              Office - HQ New York
            </span>
          </div>

          <div className="worked-hours col-lg-6">
            <div className="info">
              Today: {Math.floor(seconds / 3600)}h{" "}
              {Math.floor((seconds % 3600) / 60)}m worked
            </div>
          </div>
        </div>

      </Card.Body>
    </Card>
  );
};

export default PunchControls;
